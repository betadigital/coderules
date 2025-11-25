const cds = require('@sap/cds');
const { SELECT } = require('@sap/cds/lib/ql/cds-ql');

module.exports = (srv) => {
    const { BaseRules } = srv.entities;

    srv.before('*', async (req) => {
        // This logs the event (e.g., CREATE, READ, uploadBaseRules) and the target entity
        console.log(`[AUTH_CHECK] Incoming request for event: ${req.event}, target: ${req.target ? req.target.name : 'unknown'}`);
        if (req.user) {
            console.log("User credentials detected on HTTP request. See below:\nID: ", req.user.id, "\nRoles: ", req.user.roles);
        }
        else {
            console.log("Unauthenticated request received...");
        }
    });






    // --- Your Event Handlers ---

    // REFACTORED 'CREATE' handler
    srv.before('CREATE', 'BaseRules', async (req) => {
        const { objectType_code: objectType, ruleType_code, value } = req.data;

        // A. Validate required fields
        if (!objectType || !ruleType_code || value == null) {
            console.log(`Object type: ${objectType}, ruleType: ${ruleType_code}, value: ${value}`);
            return req.error(400, 'objectType, ruleType_code, and value are required fields.');
        }

        // B. Run the rule-specific logic validation
        const logicError = validateRuleData(req.data);
        if (logicError) {
            return req.error(logicError.code, logicError.message);
        }

        // C. Check uniqueness
        const duplicate = await SELECT.one.from(BaseRules)
            .where({
                objectType,
                ruleType_code,
                value
            });

        if (duplicate) {
            return req.error(
                409,
                `A rule already exists with the same objectType (${objectType}), ruleType (${ruleType_code}) and value (${value}). Existing ID: ${duplicate.ID}`
            );
        }

        // Otherwise allow create
    });


    srv.before('UPDATE', 'BaseRules', async (req) => {

        // 1. Get the key object of the record being updated, e.g., { ID: '...' }
        const key = req.params[0]; // Renamed from ruleId for clarity
        //
        try {

            const existingData = await SELECT.one.from(BaseRules).where(key);

            if (!existingData) {
                // Use key.ID to get the actual UUID string for the error message
                return req.error(404, `Rule with ID ${key.ID} not found.`);
            }

            // 3. Create the 'final state' by merging existing data with incoming data.
            const mergedData = { ...existingData, ...req.data };

            // 4. Run the rule-specific logic validation on the *merged* data.
            const logicError = validateRuleData(mergedData); // (This calls your helper function)
            if (logicError) {
                return req.error(logicError.code, logicError.message);
            }

            // 5. Check uniqueness (only if a relevant field is being changed)
            const { objectType_code: objectType, ruleType_code, value } = req.data;
            if (objectType || ruleType_code || value != null) {

                const duplicate = await SELECT.one.from(BaseRules)
                    .where({
                        objectType: mergedData.objectType,
                        ruleType_code: mergedData.ruleType_code,
                        value: mergedData.value,
                        ID: { '!=': key.ID }
                    });

                if (duplicate) {
                    return req.error(
                        409,
                        `An update would cause a conflict. A rule already exists with objectType (${mergedData.objectType}), ruleType (${mergedData.ruleType_code}) and value (${mergedData.value}). Existing ID: ${duplicate.ID}`
                    );
                }
            }

            // Otherwise allow update

        } catch (err) {

            console.error(err);

        }

    });


    srv.on('fileUploadBaseRules', async (req) => {
        console.log("CP1");
        const { rules: rulesJsonString } = req.data;
        if (!rulesJsonString) return req.error(400, 'No rules payload found.');

        let rules;
        try { rules = JSON.parse(rulesJsonString) }
        catch (e) { return req.error(400, `Invalid JSON payload: ${e.message}`) }

        console.log("CP2");
        if (!Array.isArray(rules) || rules.length === 0)
            return req.error(400, 'Payload must be a non-empty array of rules.');

        const tx = cds.tx(req);

        try {
            console.log("CP3");
            //Normalize input and remove empty rows
            rules = rules
                .map(r => ({
                    description: r.description?.trim(),
                    objectType: r.objectType?.trim(),
                    ruleType: r.ruleType?.trim(),
                    value: r.value?.trim()
                }))
                .filter(r => r.objectType && r.ruleType && r.value);

            if (rules.length === 0)
                return req.error(400, 'All uploaded rows were empty or invalid.');

            // Detect duplicates inside upload itself (no self-collisions)
            const seen = new Set();
            for (const r of rules) {
                const key = `${r.objectType}::${r.ruleType}::${r.value}`;
                if (seen.has(key))
                    return req.error(409, `Duplicate detected within uploaded file: (${key})`);
                seen.add(key);
            }
            console.log("CP4");
            // Detect duplicates already existing in DB
            const existing = [];
            for (let i = 0; i < rules.length; i++) {
                const [entry] = await tx.run(SELECT.from(BaseRules)
                    .columns('objectType', 'ruleType', 'value')
                    .where({
                        objectType: rules[i].objectType,
                        ruleType: rules[i].ruleType,
                        value: rules[i].value
                    }))
                if (entry) { existing.push(entry) }
            }
            console.log("CP4.5");
            console.log("existing : ", existing);

            if (existing.length > 0) {
                const duplicates = existing
                    .map(r => `${r.objectType}::${r.ruleType}::${r.value}`)
                    .join(', ');
                return req.error(409, `The following rules already exist in the system: ${duplicates}`);
            }
            console.log("CP5");

            // Perform atomic multi-insert (rollback on ANY failure)
            await tx.run(
                INSERT.into(BaseRules).entries(rules)
            );
            console.log("CP6");
            return `Successfully uploaded ${rules.length} Base Rules.`;

        } catch (err) {
            return req.error(500, `Failed to upload rules: ${err.message}`);
        }
    });


    // --- Helper Function ---
    // This function validates the 'final state' of a rule.
    function validateRuleData(data) {
        const { ruleType_code, value } = data;

        // Check for null/undefined. An empty string is a valid 'value'.
        if (value == null) {
            // This check is mainly for 'CREATE'.
            // In 'UPDATE', 'mergedData' will always have a value.
            return { code: 400, message: 'The "value" field cannot be null.' };
        }

        switch (ruleType_code) {
            case 'COMMAND':
                // Must be alphabetical. We use a regex to check.
                const alphaRegex = /^[a-zA-Z]+$/;
                if (!alphaRegex.test(value)) {
                    return {
                        code: 400,
                        message: `Rule type 'COMMAND' requires a purely alphabetical value. Received: '${value}'`
                    };
                }
                break;

            case 'LINE_WIDTH':
            case 'LINE_COUNT':
                // Must be numeric and greater than 0
                const numValue = Number(value);
                if (isNaN(numValue) || numValue <= 0) {
                    return {
                        code: 400,
                        message: `Rule type '${ruleType_code}' requires a numeric value greater than 0. Received: '${value}'`
                    };
                }
                break;

            default:
                // No specific validation for other types
                break;
        }

        return null; // No errors
    }

}
