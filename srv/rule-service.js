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

  srv.before("NEW", "UserRules", async (req) => {
    // use en-CA because it outputs YYYY-MM-DD format automatically
    req.data.effectiveDate = new Date().toLocaleDateString("en-CA", {
      timeZone: "Australia/Sydney",
    });

    // Set End Date to Infinity
    req.data.endDate = "9999-12-31";
  });

  srv.before("CREATE", "UserRules", async (req) => {
    //
    // use en-CA because it outputs YYYY-MM-DD format automatically
    req.data.effectiveDate = new Date().toLocaleDateString("en-CA", {
      timeZone: "Australia/Sydney",
    });

    // Set End Date to Infinity
    req.data.endDate = "9999-12-31";
  });

  srv.on("CREATE", "UserRules", async (req, next) => {
    console.log("LOGGING OUR REQUEST DATA", req.data);
    return next();
  });

  srv.on("UPDATE", "CodeUsers", async (req, next) => {
    console.log("LOGGING OUR REQUEST DATA", req.data);
    return next();
  });

  srv.on("applyAllRules", "CodeUsers", async (req) => {
    // Get the User ID from the bound target
    const userID = req.params[0].ID;

    // Define Dates
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const maxDate = "9999-12-31";

    const tx = cds.tx(req);

    // Fetch ALL BaseRules (The templates)
    const allBaseRules = await tx.run(SELECT.from(BaseRules));
    if (!allBaseRules || allBaseRules.length === 0) {
      return "No Base Rules found in the system.";
    }

    // Fetch EXISTING UserRules for this user (The exclusions)
    const existingUserRules = await tx.run(
      SELECT.from(UserRules).columns("baseRule_ID").where({ user_ID: userID })
    );

    // Create a Set of existing IDs for fast lookup
    const existingRuleIDs = new Set(
      existingUserRules.map((r) => r.baseRule_ID)
    );

    // Filter: Find BaseRules that are NOT in the existing set
    const rulesToCreate = allBaseRules
      .filter((baseRule) => !existingRuleIDs.has(baseRule.ID))
      .map((baseRule) => ({
        baseRule_ID: baseRule.ID,
        user_ID: userID,
        effectiveDate: today,
        endDate: maxDate,
      }));

    //  Bulk Insert (Skip if nothing to add)
    if (rulesToCreate.length > 0) {
      await tx.run(INSERT.into(UserRules).entries(rulesToCreate));

      // Optional: Notify the UI to refresh
      req.notify({
        message: `Successfully applied ${rulesToCreate.length} new rules.`,
        type: "success",
      });

      return `${rulesToCreate.length} rules applied.`;
    } else {
      req.notify({
        message: "User already has all applicable rules.",
        type: "info",
      });
      return "No new rules to apply.";
    }
  });

  srv.on("initNewUserRules", async (req) => {
    // Get the User ID from the bound target
    const { userId } = req.data;

    // Define Dates
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const maxDate = "9999-12-31";

    const tx = cds.tx(req);

    // Check user exists or not
    const user = await tx.run(SELECT.one.from(CodeUsers).where({ ID: userId }));

    // if no user, make user with trusted=false
    if (!user) {
      await tx.run(
        INSERT.into(CodeUsers).entries({ ID: userId, trusted: false })
      );
    }

    // Fetch ALL BaseRules (The templates)
    const allBaseRules = await tx.run(SELECT.from(BaseRules));
    if (!allBaseRules || allBaseRules.length === 0) {
      return "No Base Rules found in the system.";
    }

    // Fetch EXISTING UserRules for this user (The exclusions)
    const existingUserRules = await tx.run(
      SELECT.from(UserRules).columns("baseRule_ID").where({ user_ID: userId })
    );

    // Create a Set of existing IDs for fast lookup
    const existingRuleIDs = new Set(
      existingUserRules.map((r) => r.baseRule_ID)
    );

    // Filter: Find BaseRules that are NOT in the existing set
    const rulesToCreate = allBaseRules
      .filter((baseRule) => !existingRuleIDs.has(baseRule.ID))
      .map((baseRule) => ({
        baseRule_ID: baseRule.ID,
        user_ID: userId,
        effectiveDate: today,
        endDate: maxDate,
      }));

    //  Bulk Insert (Skip if nothing to add)
    if (rulesToCreate.length > 0) {
      await tx.run(INSERT.into(UserRules).entries(rulesToCreate));

      // Optional: Notify the UI to refresh
      req.notify({
        message: `Successfully applied ${rulesToCreate.length} new rules.`,
        type: "success",
      });

      return `${rulesToCreate.length} rules applied.`;
    } else {
      req.notify({
        message: "User already has all applicable rules.",
        type: "info",
      });
      return "No new rules to apply.";
    }
  });

  /**
   * Helper to handle trust updates and force UI refresh
   */
  const _updateTrustStatus = async (req, isTrusted) => {
    const { ID } = req.params[0];
    const actionVerb = isTrusted ? "trusted" : "untrusted";

    console.log(`Making user ${ID} ${actionVerb}.`);

    try {
      await cds.run(UPDATE("CodeUser", ID).with({ trusted: isTrusted }));

      const updatedUser = await cds.run(
        SELECT.one.from(CodeUsers).where({ ID: ID })
      );

      // Return the Object + Refresh Flag
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
  srv.on("addLogs", async (req) => {
    //  Get the array of logs from the request data
    console.log("YOU HAVE SUCCESSFULLY CALLED ADD LOGS!");
    const { logs } = req.data;
    console.log("Logs are... ", logs);

    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      return req.error(
        400,
        "The request body must contain a non-empty array of logs."
      );
    }

    const failedIndices = [];
    let successfulCount = 0;

    // Iterate through each log object with its index
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];

      // Use a self-contained try/catch block for each individual log
      try {
        const {
          user,
          transportRequest,
          subRequest,
          checkDate,
          objectType,
          ruleType,
          value,
          result,
          objectName,
          severity,
        } = log;

        // ---  Validation Check ---
        if (
          !user ||
          !transportRequest ||
          !subRequest ||
          !checkDate ||
          !objectType ||
          !ruleType ||
          !value ||
          !result ||
          !severity ||
          !objectName
        ) {
          // If validation fails, skip this log and record the index
          throw new Error("Missing required field(s).");
        }

        // --- Result Value Check ---
        const cleanResult = result.toLowerCase().trim();
        if (!(cleanResult === "pass" || cleanResult === "fail")) {
          throw new Error(`Result '${result}' is invalid.`);
        }

        // --- Database Operations (Execute within a new transaction) ---

        console.log("cp1");
        let existingRule = await cds.run(
          SELECT.one
            .from(BaseRules)
            .where({ objectType: objectType, ruleType: ruleType, value: value })
        );

        if (!existingRule) {
          console.log("cp2");
          // throw error to escape loop
          if (!existingRule) {
            // Create this rule if it doesnt exist.
            const rulePayload = {
              objectType_code: objectType,
              ruleType_code: ruleType,
              value: value,
              severityRating: severity,
            };
            await cds.run(INSERT.into(BaseRules).entries(rulePayload));
            existingRule = await cds.run(
              SELECT.one.from(BaseRules).where({
                objectType: objectType,
                ruleType_code: ruleType,
                value: value,
              })
            );
            console.log("cp3");
          }
        }

        // Prepare the final payload for the AutomationLog
        const payload = {
          user: { ID: user }, // Ensure association structure is correct
          transportRequest: transportRequest,
          subRequest: subRequest,
          checkDate: checkDate,
          baseRule: existingRule,
          result: cleanResult.toUpperCase(),
          severity: severity,
          objectName: objectName,
        };
        console.log("cp4");
        console.log(payload);

        // Insert the log
        await cds.run(INSERT.into(AutomationLogs).entries(payload));
        console.log("cp5");
        successfulCount++; // Increment count on success
      } catch (err) {
        // Catch any errors (validation or DB errors) for this specific log
        console.error(
          `Failed to process log at index ${i}. Error: ${err.message}`
        );
        failedIndices.push(i);
      }
    }

    // --- Return Summary String ---
    const totalLogs = logs.length;
    let message = `${successfulCount} of ${totalLogs} logs added successfully.`;

    if (failedIndices.length > 0) {
      message += `\nFailed indices: [${failedIndices.join(
        ", "
      )}]. See backend logs for details.`;
    }

    return message;
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
        baseRule_objectType: baseRule.objectType_code,
        baseRule_value: baseRule.value,
        baseRule_ruleType_code: ruleType.code,
        baseRule_ruleType_description: ruleType.description,
        user_ID: user,
        baseRule_severityRating: baseRule.severityRating,
        user_trusted: isTrusted,
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

    // Build the base query
    const query = _buildSelectQuery();

    console.log("trying deep filter");
    // Add the WHERE clause with the deep filter
    query.where({
      user_ID: userId,
      effectiveDate: { "<=": today },
      endDate: { ">=": today },
      // DEEP FILTER: Navigate from UserRule -> BaseRule -> ObjectType -> Active
      "baseRule.objectType.active": true,
    });

    //  Run the query
    const activeRulesResult = await tx.run(query);

    // Get User Trust status
    const userRecord = await tx.run(
      SELECT.one.from(CodeUsers).columns("trusted").where({ ID: userId })
    );
    const isTrusted = userRecord ? userRecord.trusted : false;

    // Return flattened results
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

    //  Build the base query
    const query = _buildSelectQuery();

    // Add the WHERE clause for this function
    query.where({ user_ID: userId });

    //  Run the query
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
