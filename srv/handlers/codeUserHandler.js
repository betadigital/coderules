const cds = require("@sap/cds");
const { CodeUse } = cds.entities;

class CodeUserHandlers {
  /**
   * Logs authorization details for incoming requests.
   */
  static async logRequest(req) {
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
  }

  /**
   * Generic helper for updating trust state.
   */
  static async updateTrustStatus(req, isTrusted) {
    const { ID } = req.params[0];
    const actionVerb = isTrusted ? "trusted" : "untrusted";

    try {
      await cds.run(UPDATE(CodeUse).set({ trusted: isTrusted }).where({ ID }));
      const updatedUser = await cds.run(SELECT.one.from(CodeUse).where({ ID }));

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
  }

  /**
   * Action: setTrustedUser
   */
  static async onSetTrustedUser(req) {
    const { userId, trusted } = req.data;
    if (!userId) return req.error(400, "User ID is required");
    await cds.run(UPDATE(CodeUse).set({ trusted }).where({ ID: userId }));
    return "OK";
  }
}

module.exports = CodeUserHandlers;
