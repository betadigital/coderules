const cds = require("@sap/cds");
const CRUD = require("./handlers/baseRuleCRUDHandler");
const Upload = require("./handlers/baseRuleUpload");

module.exports = cds.service.impl(async function () {
  const { BaseRules } = this.entities;

  // --- Global Hooks ---
  this.before("*", async (req) => {
    console.log(`[AUTH_CHECK] Event: ${req.event}, target: ${req.target?.name}`);
    if (req.user) console.log(`User: ${req.user.id} | Roles: ${req.user.roles}`);
  });

  // --- Standard Persistence ---
  this.before("CREATE", BaseRules, CRUD.beforeCreate);
  this.before("UPDATE", BaseRules, CRUD.beforeUpdate);

  // --- Actions ---
  this.on("fileUploadBaseRules", Upload.onFileUploadBaseRules);
});
