const cds = require("@sap/cds");
const { BaseRule } = cds.entities("codeRules");

class BaseRuleUploadHandler {
  static async onFileUploadBaseRules(req) {
    const { rules: rulesJsonString } = req.data;
    if (!rulesJsonString) return req.error(400, "No rules payload found.");

    let rules;
    try {
      rules = JSON.parse(rulesJsonString);
    } catch (e) {
      return req.error(400, `Invalid JSON: ${e.message}`);
    }

    if (!Array.isArray(rules) || rules.length === 0)
      return req.error(400, "Payload must be a non-empty array.");

    const tx = cds.tx(req);
    try {
      rules = rules
        .map((r) => ({
          description: r.description?.trim(),
          objectType: r.objectType?.trim(),
          ruleType: r.ruleType?.trim(),
          value: r.value?.trim(),
        }))
        .filter((r) => r.objectType && r.ruleType && r.value);

      if (rules.length === 0)
        return req.error(400, "All rows were empty or invalid.");

      // Internal duplicate check
      const seen = new Set();
      for (const r of rules) {
        const key = `${r.objectType}::${r.ruleType}::${r.value}`;
        if (seen.has(key)) return req.error(409, `Duplicate in file: (${key})`);
        seen.add(key);
      }

      // Database duplicate check
      for (const r of rules) {
        const [exists] = await tx.run(
          SELECT.from(BaseRule).where({
            objectType: r.objectType,
            ruleType: r.ruleType,
            value: r.value,
          }),
        );
        if (exists)
          return req.error(
            409,
            `Rule already exists: ${r.objectType}::${r.ruleType}::${r.value}`,
          );
      }

      await tx.run(INSERT.into(BaseRule).entries(rules));
      return `Successfully uploaded ${rules.length} Base Rules.`;
    } catch (err) {
      return req.error(500, `Upload failed: ${err.message}`);
    }
  }
}

module.exports = BaseRuleUploadHandler;
