const cds = require("@sap/cds");
const CRUD = require("./handlers/baseRuleCRUDHandler");
const Upload = require("./handlers/baseRuleUpload");

module.exports = cds.service.impl(async function () {
  const { BaseRules } = this.entities;

  // --- Global Hooks ---
  this.before("*", CRUD.logRequest);

  // --- Standard Persistence ---
  this.before("CREATE", BaseRules, CRUD.beforeCreate);
  this.before("UPDATE", BaseRules, CRUD.beforeUpdate);

  // --- Actions ---
  this.on("fileUploadBaseRules", Upload.onFileUploadBaseRules);
});
