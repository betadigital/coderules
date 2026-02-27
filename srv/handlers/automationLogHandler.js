const cds = require("@sap/cds");
const { BaseRule, AutomationLog } = cds.entities;

class AutomationLogHandler {
  /**
   * Action: addLogs
   * Normalizes logs and dynamically creates BaseRules if they are missing.
   */
  static async onAddLogs(req) {
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
        if (!["pass", "fail"].includes(cleanResult))
          throw new Error(`Invalid result '${result}'`);

        // Ensure BaseRule exists
        let existingRule = await cds.run(
          SELECT.one.from(BaseRule).where({ objectType, ruleType, value }),
        );

        if (!existingRule) {
          await cds.run(
            INSERT.into(BaseRule).entries({
              objectType_code: objectType,
              ruleType_code: ruleType,
              value,
              severityRating: severity,
            }),
          );
          existingRule = await cds.run(
            SELECT.one
              .from(BaseRule)
              .where({ objectType, ruleType_code: ruleType, value }),
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
          codeQualityRule,
          baseRule: existingRule,
        };

        await cds.run(INSERT.into(AutomationLog).entries(payload));
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
  }
}

module.exports = AutomationLogHandler;
