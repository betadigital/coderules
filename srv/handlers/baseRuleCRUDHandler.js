const cds = require("@sap/cds");

// Entity references using deconstruction
const { BaseRules, RuleTypes } = cds.entities("codeRules");

class BaseRuleCRUDHandler {
  /**
   * Shared Validation Logic: Checks value types against RuleType definitions
   */
  static async validateRuleData(data) {
    const { ruleType_code, value } = data;
    if (!ruleType_code || value == null) {
      return { code: 400, message: "ruleType_code and value are required." };
    }

    const ruleType = await SELECT.one.from(RuleTypes).where({ code: ruleType_code });
    if (!ruleType)
      return { code: 400, message: `Unknown ruleType '${ruleType_code}'` };

    const { valueType } = ruleType;
    switch (valueType) {
      case "integer":
        if (!Number.isInteger(Number(value))) {
          return { code: 400, message: `Value '${value}' must be an integer.` };
        }
        break;
      case "float":
        if (isNaN(Number(value))) {
          return { code: 400, message: `Value '${value}' must be numeric.` };
        }
        break;
      case "boolean":
        if (!["true", "false", "1", "0"].includes(String(value).toLowerCase())) {
          return { code: 400, message: `Value '${value}' must be boolean.` };
        }
        break;
      case "string":
        if (Number.isInteger(Number(value))) {
          return { code: 400, message: `Value '${value}' must not be an integer.` };
        }
        break;
      case "none":
        break;
      default:
        return { code: 400, message: `Unsupported valueType '${valueType}'.` };
    }
    return null;
  }

  /**
   * srv.before("CREATE")
   */
  static async beforeCreate(req) {
    const { objectType_code: objectType, ruleType_code, value } = req.data;

    if (!objectType || !ruleType_code || value == null) {
      return req.error(400, "objectType, ruleType_code, and value are required.");
    }

    const logicError = await BaseRuleCRUDHandler.validateRuleData(req.data);
    if (logicError) return req.error(logicError.code, logicError.message);

    const duplicate = await SELECT.one
      .from(BaseRules)
      .where({ objectType, ruleType_code, value });
    if (duplicate)
      return req.error(409, `Rule already exists (ID: ${duplicate.ID})`);
  }

  /**
   * srv.before("UPDATE")
   */
  static async beforeUpdate(req) {
    const keyID = req.params[0]?.ID || req.params[0];
    const existingData = await SELECT.one.from(BaseRules).where({ ID: keyID });
    if (!existingData) return req.error(404, `Rule not found.`);

    const mergedData = { ...existingData, ...req.data };
    const logicError = await BaseRuleCRUDHandler.validateRuleData(mergedData);
    if (logicError) return req.error(logicError.code, logicError.message);

    const { objectType_code, ruleType_code, value } = req.data;
    if (objectType_code || ruleType_code || value != null) {
      const duplicate = await SELECT.one.from(BaseRules).where({
        objectType_code: mergedData.objectType_code,
        ruleType_code: mergedData.ruleType_code,
        value: mergedData.value,
        ID: { "!=": keyID },
      });
      if (duplicate) return req.error(409, `An update would cause a conflict.`);
    }
  }

  static async logRequest(req) {
    console.log(`[AUTH_CHECK] Event: ${req.event}, target: ${req.target?.name}`);
    if (req.user) console.log(`User: ${req.user.id} | Roles: ${req.user.roles}`);
  }
}

module.exports = BaseRuleCRUDHandler;
