const cds = require("@sap/cds");
const { SELECT, UPDATE, INSERT } = cds.ql;

module.exports = (srv) => {
  const { BaseRules, CodeUsers, AutomationLogs } = srv.entities;

  /**
   * Generic logging (optional but still helpful)
   */
  srv.before("*", async (req) => {
    console.log(
      `[AUTH_CHECK] Event: ${req.event}, Target: ${req.target?.name ?? "unknown"}`,
    );

    if (req.user) {
      console.log(
        "User:",
        req.user.id,
        "Roles:",
        req.user.roles,
        "Email:",
        req.user.attr?.email,
      );
    }
  });

  /**
   * Log CodeUser updates (optional)
   */
  srv.on("UPDATE", "CodeUsers", async (req, next) => {
    console.log("Updating CodeUser with:", req.data);
    return next();
  });

  /**
   * Shared trust update helper
   */
  const _updateTrustStatus = async (req, isTrusted) => {
    const { ID } = req.params[0];
    const actionVerb = isTrusted ? "trusted" : "untrusted";

    try {
      await cds.run(
        UPDATE(CodeUsers).set({ trusted: isTrusted }).where({ ID }),
      );

      const updatedUser = await cds.run(
        SELECT.one.from(CodeUsers).where({ ID }),
      );

      return {
        ...updatedUser,
        "@fiori.message": {
          message: `Successfully set user ${ID} to ${actionVerb}.`,
          severity: "success",
          refresh: true,
        },
      };
    } catch (err) {
      return req.error(500, `Failed to update trust state: ${err.message}`);
    }
  };

  srv.on("makeTrusted", (req) => _updateTrustStatus(req, true));
  srv.on("makeUntrusted", (req) => _updateTrustStatus(req, false));

  /**
   * addLogs remains the main operational logic
   */
  srv.on("addLogs", async (req) => {
    console.log("addLogs called:", req.data.logs);

    const { logs } = req.data;
    if (!Array.isArray(logs) || logs.length === 0) {
      return req.error(400, "Logs must be a non-empty array");
    }

    let successful = 0;
    const failed = [];

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];

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
          severity,
          objectName,
          codeQualityRule,
        } = log;

        // Basic validation
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
          !objectName ||
          !codeQualityRule
        ) {
          throw new Error("Missing required field(s)");
        }

        const cleanResult = result.toLowerCase().trim();
        if (!["pass", "fail"].includes(cleanResult)) {
          throw new Error(`Invalid result '${result}'`);
        }

        let existingRule = await cds.run(
          SELECT.one.from(BaseRules).where({ objectType, ruleType, value }),
        );

        if (!existingRule) {
          const rulePayload = {
            objectType_code: objectType,
            ruleType_code: ruleType,
            value,
            severityRating: severity,
          };

          await cds.run(INSERT.into(BaseRules).entries(rulePayload));

          existingRule = await cds.run(
            SELECT.one.from(BaseRules).where({
              objectType,
              ruleType_code: ruleType,
              value,
            }),
          );
        }

        const payload = {
          user: { ID: user },
          transportRequest,
          subRequest,
          checkDate,
          result: cleanResult.toUpperCase(),
          severity,
          objectName,
          codeQualityRule: codeQualityRule,
          baseRule: existingRule,
        };

        await cds.run(INSERT.into(AutomationLogs).entries(payload));
        successful++;
      } catch (err) {
        console.error(`Failed to process log[${i}]:`, err.message);
        failed.push(i);
      }
    }

    return (
      `${successful} of ${logs.length} logs added successfully.` +
      (failed.length ? ` Failed indices: [${failed.join(", ")}]` : "")
    );
  });

  srv.on("addTransportOutcomes", async (req) => {
    console.log("addTransportOutcomes called");

    const { transportOutcomes } = req.data;
    if (!Array.isArray(transportOutcomes) || transportOutcomes.length === 0) {
      return req.error(400, "Outcomes must be a non-empty array");
    }

    let successful = 0;
    const failed = [];

    for (let i = 0; i < transportOutcomes.length; i++) {
      const entry = transportOutcomes[i];

      try {
        const { user, transportRequest, failedChecks } = entry;

        // Basic validation for required fields
        if (!user || !transportRequest || failedChecks === undefined) {
          throw new Error(
            "Missing required fields: user, transportRequest, or failedChecks",
          );
        }

        // Construct payload for the TransportOutcome entity
        const payload = {
          user_ID: user, // Assuming CodeUser ID is the link
          transportRequest: transportRequest,
          failedChecks: failedChecks,
        };

        // Insert into the TransportOutcomes projection/entity
        await cds.run(INSERT.into("TransportOutcomes").entries(payload));

        successful++;
      } catch (err) {
        console.error(`Failed to process transportOutcome[${i}]:`, err.message);
        failed.push(i);
      }
    }

    const response = `${successful} of ${transportOutcomes.length} outcomes added successfully.`;
    return failed.length
      ? `${response} Failed indices: [${failed.join(", ")}]`
      : response;
  });

  /**
   * Simplified setTrustedUser (optional now)
   */
  srv.on("setTrustedUser", async (req) => {
    const { userId, trusted } = req.data;
    if (!userId) return req.error(400, "User ID is required");

    await cds.run(UPDATE(CodeUsers).set({ trusted }).where({ ID: userId }));
    return "OK";
  });
};
