const cds = require("@sap/cds");
const Users = require("./handlers/codeUserHandler");
const AutomationLogs = require("./handlers/automationLogHandler");
const TransportOutcomes = require("./handlers/transportOutcomeHandler");

module.exports = cds.service.impl(async function () {
  const { CodeUsers } = this.entities;

  /**
   * Generic logging (optional but still helpful)
   */
  this.before("*", async (req) => {
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

  // --- User Management Handlers ---
  this.on("UPDATE", "CodeUsers", async (req, next) => {
    console.log("Updating CodeUser with:", req.data);
    return next();
  });
  this.on("makeTrusted", CodeUsers, (req) => Users.updateTrustStatus(req, true));
  this.on("makeUntrusted", CodeUsers, (req) => Users.updateTrustStatus(req, false));
  this.on("setTrustedUser", Users.onSetTrustedUser);

  // --- Operational Log Handlers ---
  this.on("addLogs", AutomationLogs.onAddLogs);
  this.on("addTransportOutcomes", TransportOutcomes.onAddTransportOutcomes);
});
