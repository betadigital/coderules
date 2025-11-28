const cds = require("@sap/cds");
const { UPDATE, SELECT } = require("@sap/cds/lib/ql/cds-ql");

module.exports = (srv) => {
  // Get the entities from your service definition (the projections)
  const { UserRules, BaseRules, CodeUsers, AutomationLogs } = srv.entities;

  srv.before("*", async (req) => {
    // This logs the event (e.g., CREATE, READ, uploadBaseRules) and the target entity
    console.log(
      `[AUTH_CHECK] Incoming request for event: ${req.event}, target: ${
        req.target ? req.target.name : "unknown"
      }`
    );
    if (req.user) {
      console.log(
        "User credentials detected on HTTP request. See below:\nID: ",
        req.user.id,
        "\nRoles: ",
        req.user.roles,
        "\nEmail: ",
        req.user.attr.email
      );
    } else {
      console.log("Unauthenticated request received...");
    }
  });

  /**
   * Helper to handle trust updates and force UI refresh
   */
  const _updateTrustStatus = async (req, isTrusted) => {
    // 1. FIX: Extract the ID string correctly from the key object
    const { ID } = req.params[0];
    const actionVerb = isTrusted ? "trusted" : "untrusted";

    console.log(`Making user ${ID} ${actionVerb}.`);

    try {
      // 2. Update the Database Entity
      // We use the DB entity (CodeUser) for the update to avoid projection issues
      await cds.run(UPDATE("CodeUser", ID).with({ trusted: isTrusted }));

      // 3. Select the updated record from the SERVICE PROJECTION (CodeUsers)
      // We select from the Projection so that the 'untrusted' calculated field
      // is automatically re-calculated by the database View/Projection.
      const updatedUser = await cds.run(
        SELECT.one.from(CodeUsers).where({ ID: ID })
      );

      // 4. Return the Object + Refresh Flag
      // We must return the entity data so Fiori Elements can update the model immediately.
      return {
        ...updatedUser,
        "@fiori.message": {
          code: "",
          message: `Successfully set user ${ID} to ${actionVerb}.`,
          severity: "success",
          target: ID,
          refresh: true, // <--- Forces the Object Page to refresh
        },
      };
    } catch (err) {
      return req.error(500, `Failed to update user: ${err.message}`);
    }
  };

  // --- Action Handlers ---

  srv.on("makeTrusted", async (req) => {
    return _updateTrustStatus(req, true);
  });

  srv.on("makeUntrusted", async (req) => {
    return _updateTrustStatus(req, false);
  });

  /**
   * Method to add a log via api call.
   */
  srv.on("addLog", async (req) => {
    const {
      user,
      transportRequest,
      checkDate,
      objectType,
      ruleType,
      value,
      result,
      objectName,
      severity,
    } = req.data;

    if (
      !user ||
      !transportRequest ||
      !checkDate ||
      !objectType ||
      !ruleType ||
      !value ||
      !result ||
      !severity ||
      !objectName
    ) {
      return req.error(
        400,
        `One (or more) of the required fields is invalid.
                Received: userId: ${user}, transportRequest: ${transportRequest}, checkDate: ${checkDate}, objectType: ${objectType}, 
                ruleType: ${ruleType}, value: ${value}, result: ${result}`
      );
    }

    console.log(result.toLowerCase().trim());
    if (
      !(
        result.toLowerCase().trim() == "pass" ||
        result.toLowerCase().trim() == "fail"
      )
    ) {
      return req.error(400, `Result ${result} invalid.`);
    }

    try {
      const tx = cds.tx(req);
      let existingRule = await tx.run(
        SELECT.one
          .from(BaseRules)
          .where({ objectType: objectType, ruleType: ruleType, value: value })
      );
      console.log(existingRule);
      if (!existingRule) {
        // Create this rule if it doesnt exist.
        const rulePayload = {
          objectType_code: objectType,
          ruleType_code: ruleType,
          value: value,
          severityRating: 1,
        };
        await tx.run(INSERT.into(BaseRules).entries(rulePayload));
        existingRule = await tx.run(
          SELECT.one.from(BaseRules).where({
            objectType: objectType,
            ruleType_code: ruleType,
            value: value,
          })
        );
      }
      const payloadUser = { ID: user };

      const payload = {
        user: payloadUser,
        transportRequest: transportRequest,
        checkDate: checkDate,
        baseRule: existingRule,
        result: result.toUpperCase(),
        severity: severity,
        objectName: objectName,
      };
      const newLog = await tx.run(INSERT.into(AutomationLogs).entries(payload));
    } catch (err) {
      return req.error(500, err.message);
    }

    return `Successfully inserted AutomationLog.`;
  });

  /**
   * Reusable query to get all user rule data with nested associations.
   * We will flatten this result in our functions.
   */
  const _buildSelectQuery = () => {
    return SELECT.from(UserRules, (r) => {
      r.effectiveDate,
        r.endDate,
        r.baseRule((b) => {
          b.ID,
            b.objectType,
            b.value,
            b.severityRating,
            b.ruleType((rt) => {
              rt.code, rt.description;
            });
        });
    });
  };

  /**
   * Reusable function to flatten the query result.
   */
  const _flattenRules = (rules, user, isTrusted) => {
    if (!rules || rules.length === 0) {
      return [];
    }

    console.log("Rules are :", rules);
    return rules.map((rule) => {
      // Handle cases where baseRule or ruleType might be null
      const baseRule = rule.baseRule || {};
      const ruleType = baseRule.ruleType || {};

      return {
        effectiveDate: rule.effectiveDate,
        endDate: rule.endDate,
        baseRule_ID: baseRule.ID,
        baseRule_objectType: baseRule.objectType,
        baseRule_value: baseRule.value,
        baseRule_ruleType_code: ruleType.code,
        baseRule_ruleType_description: ruleType.description,
        user_ID: user,
        baseRule_severityRating: baseRule.severityRating,
        user_isTrusted: isTrusted,
      };
    });
  };

  /**
   * Get all rules that are currently active for a user.
   * (Current date is between effectiveDate and endDate)
   *
   * This implementation returns a flatten json string array.
   */
  srv.on("getApplicableRules", async (req) => {
    const { userId } = req.data;
    if (!userId) {
      return req.error(400, "User ID is required");
    }

    const tx = cds.tx(req);
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Australia/Sydney",
    });
    //  Build the base query
    const query = _buildSelectQuery();

    // Add the WHERE clause for this function
    query.where({
      user_ID: userId,
      and: {
        effectiveDate: { "<=": today },
        endDate: { ">=": today },
      },
    });

    // Run the query
    const activeRulesResult = await tx.run(query);
    const userRecord = await tx.run(
      SELECT.one.from(CodeUsers).columns("trusted").where({ ID: userId })
    );
    const isTrusted = userRecord ? userRecord.trusted : false;

    // Flatten the result using the map helper
    return _flattenRules(activeRulesResult, userId, isTrusted);
  });

  /**
   * Get all rules assigned to a user, regardless of date.
   */
  srv.on("getAllRules", async (req) => {
    const { userId } = req.data;
    if (!userId) {
      return req.error(400, "User ID is required");
    }

    const tx = cds.tx(req);

    // 1. Build the base query
    const query = _buildSelectQuery();

    // 2. Add the WHERE clause for this function
    query.where({ user_ID: userId });

    // 3. Run the query
    const allRulesResult = await tx.run(query);
    const userRecord = await tx.run(
      SELECT.one.from(CodeUsers).columns("trusted").where({ ID: userId })
    );
    const isTrusted = userRecord ? userRecord.trusted : false;

    // 4. Flatten the result using the map helper
    return _flattenRules(allRulesResult, userId, isTrusted);
  });

  srv.on("setTrustedUser", async (req) => {
    const { userId, trusted } = req.data;

    if (!userId) {
      return req.error(400, "User ID is required");
    }

    const tx = cds.tx(req);

    const [user] = await tx.run(
      UPDATE(CodeUsers).set({ trusted: trusted }).where({ ID: userId })
    );

    return user;
  });

  /**
   * Checks for and removes all rules for a user that are no longer valid.
   * (Current date is NOT between effectiveDate and endDate)
   */
  srv.on("checkForOverdueRules", async (req) => {
    const { userId } = req.data;
    if (!userId) {
      return req.error(400, "User ID is required");
    }
    const tx = cds.tx(req);
    const today = new Date().toISOString().split("T")[0];

    const overdueRules = await tx.run(
      SELECT.from(UserRules, ["ID"]).where({
        user_ID: userId, // Filter by the user (string ID)
        and: {
          effectiveDate: { ">": today }, // and today is on or after the start date
          endDate: { "<": today }, // and today is on or before the end date
        },
      })
    );

    if (overdueRules.length === 0) {
      return `No overdue rules found for user ${userId}.`;
    }

    // 2. Get the list of IDs and delete them
    const ruleIDs = overdueRules.map((rule) => rule.ID);

    // Use the service projection 'UserRules'
    const deleteResult = await tx.run(
      DELETE.from(UserRules).where({ ID: { in: ruleIDs } })
    );

    // deleteResult is the number of rows affected
    return `Removed ${deleteResult} overdue rules for user ${userId}.`;
  });
};
