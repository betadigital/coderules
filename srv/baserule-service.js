const cds = require("@sap/cds");
const { SELECT, INSERT } = require("@sap/cds/lib/ql/cds-ql");

module.exports = (srv) => {
  const { BaseRules, RuleTypes } = srv.entities;

  srv.before("*", async (req) => {
    // This logs the event (e.g., CREATE, READ, uploadBaseRules) and the target entity
    console.log(
      `[AUTH_CHECK] Incoming request for event: ${req.event}, target: ${
        req.target ? req.target.name : "unknown"
      }`,
    );
    if (req.user) {
      console.log(
        "User credentials detected on HTTP request. See below:\nID: ",
        req.user.id,
        "\nRoles: ",
        req.user.roles,
      );
    } else {
      console.log("Unauthenticated request received...");
    }
  });

  // --- Your Event Handlers ---
  async function validateRuleData(data) {
    console.log("validating rule data: ", data);
    const { ruleType_code, value } = data;

    if (!ruleType_code || value == null) {
      return { code: 400, message: "ruleType_code and value are required." };
    }

    // Fetch the RuleType to get its valueType
    const ruleType = await SELECT.one.from(RuleTypes).where({ code: ruleType_code });

    console.log("rule type is: ", ruleType);
    if (!ruleType) {
      return { code: 400, message: `Unknown ruleType '${ruleType_code}'` };
    }

    const { valueType } = ruleType;

    console.log("value type is: ", valueType);
    switch (valueType) {
      case "integer":
        console.log("integer value type, with value = ", value);
        if (!Number.isInteger(Number(value))) {
          return {
            code: 400,
            message: `Value '${value}' must be an integer for ruleType '${ruleType_code}'.`,
          };
        }
        break;

      case "float":
        console.log("float value type, with value = ", value);
        if (isNaN(Number(value))) {
          return {
            code: 400,
            message: `Value '${value}' must be numeric for ruleType '${ruleType_code}'.`,
          };
        }
        break;

      case "boolean":
        console.log("boolean value type, with value = ", value);
        if (!["true", "false", "1", "0"].includes(String(value).toLowerCase())) {
          return {
            code: 400,
            message: `Value '${value}' must be boolean for ruleType '${ruleType_code}'.`,
          };
        }
        break;

      case "string":
        // always valid
        console.log("string value type, with value = ", value);
        if (Number.isInteger(Number(value))) {
          return {
            code: 400,
            message: `Value '${value}' must not be integer for ruleType '${ruleType_code}'.`,
          };
        }
        break;

      default:
        return {
          code: 400,
          message: `Unsupported valueType '${valueType}' for ruleType '${ruleType_code}'.`,
        };
    }

    // no errors
    return null;
  }

  // --- CREATE handler---
  srv.before("CREATE", BaseRules, async (req) => {
    const { objectType_code: objectType, ruleType_code, value } = req.data;

    // Validate required fields
    if (!objectType || !ruleType_code || value == null) {
      return req.error(
        400,
        "objectType, ruleType_code, and value are required fields.",
      );
    }

    // Run valueType validation
    console.log("running validation checks");
    const logicError = await validateRuleData(req.data);
    if (logicError) return req.error(logicError.code, logicError.message);

    // Check uniqueness
    const duplicate = await SELECT.one.from(BaseRules).where({
      objectType,
      ruleType_code,
      value,
    });

    if (duplicate) {
      return req.error(
        409,
        `A rule already exists with objectType (${objectType}), ruleType (${ruleType_code}) and value (${value}). Existing ID: ${duplicate.ID}`,
      );
    }

    // Otherwise allow creation
  });

  // --- UPDATE handler ---
  srv.before("UPDATE", "BaseRules", async (req) => {
    const keyID = req.params[0].ID || req.params[0];

    // Fetch existing data using the ID specifically
    const existingData = await SELECT.one.from(BaseRules).where({ ID: keyID });

    if (!existingData) return req.error(404, `Rule not found.`);

    const mergedData = { ...existingData, ...req.data };

    // Run valueType validation
    console.log("running validation checks");
    const logicError = await validateRuleData(mergedData);
    if (logicError) return req.error(logicError.code, logicError.message);

    // Check uniqueness only if relevant fields are being changed
    const { objectType_code: objectType, ruleType_code, value } = req.data;
    if (objectType || ruleType_code || value != null) {
      const duplicate = await SELECT.one.from(BaseRules).where({
        objectType_code: mergedData.objectType_code, // Use the _code suffix
        ruleType_code: mergedData.ruleType_code,
        value: mergedData.value,
        ID: { "!=": keyID },
      });

      if (duplicate) {
        return req.error(409, `An update would cause a conflict...`);
      }
    }
  });

  srv.on("fileUploadBaseRules", async (req) => {
    const { rules: rulesJsonString } = req.data;
    if (!rulesJsonString) return req.error(400, "No rules payload found.");

    let rules;
    try {
      rules = JSON.parse(rulesJsonString);
    } catch (e) {
      return req.error(400, `Invalid JSON payload: ${e.message}`);
    }

    if (!Array.isArray(rules) || rules.length === 0)
      return req.error(400, "Payload must be a non-empty array of rules.");

    const tx = cds.tx(req);

    try {
      //Normalize input and remove empty rows
      rules = rules
        .map((r) => ({
          description: r.description?.trim(),
          objectType: r.objectType?.trim(),
          ruleType: r.ruleType?.trim(),
          value: r.value?.trim(),
        }))
        .filter((r) => r.objectType && r.ruleType && r.value);

      if (rules.length === 0)
        return req.error(400, "All uploaded rows were empty or invalid.");

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
        const [entry] = await tx.run(
          SELECT.from(BaseRules).columns("objectType", "ruleType", "value").where({
            objectType: rules[i].objectType,
            ruleType: rules[i].ruleType,
            value: rules[i].value,
          }),
        );
        if (entry) {
          existing.push(entry);
        }
      }
      console.log("CP4.5");
      console.log("existing : ", existing);

      if (existing.length > 0) {
        const duplicates = existing
          .map((r) => `${r.objectType}::${r.ruleType}::${r.value}`)
          .join(", ");
        return req.error(
          409,
          `The following rules already exist in the system: ${duplicates}`,
        );
      }
      console.log("CP5");

      // Perform atomic multi-insert (rollback on ANY failure)
      await tx.run(INSERT.into(BaseRules).entries(rules));
      console.log("CP6");
      return `Successfully uploaded ${rules.length} Base Rules.`;
    } catch (err) {
      return req.error(500, `Failed to upload rules: ${err.message}`);
    }
  });
};
