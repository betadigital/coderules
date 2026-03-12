const cds = require("@sap/cds");
const ObjectTypeHandlers = require("./handlers/objectTypeHandlers");

module.exports = cds.service.impl(async function () {
  const { ObjectTypes } = this.entities;

  // --- Global Hooks ---
  this.before("*", ObjectTypeHandlers.onBeforeRequest);

  // --- Unbound Actions ---
  this.on("addProgrammableType", ObjectTypeHandlers.onAddProgrammableType);

  // --- Bound Actions (Targeting ObjectTypes entity) ---
  this.on("makeManual", ObjectTypes, ObjectTypeHandlers.onMakeManual);
  this.on("makeActive", ObjectTypes, ObjectTypeHandlers.onMakeActive);
  this.on("makeInactive", ObjectTypes, ObjectTypeHandlers.onMakeInactive);
  this.on("toggle", ObjectTypes, ObjectTypeHandlers.onToggle);
  this.on("exclude", ObjectTypes, ObjectTypeHandlers.onExclude);
});
