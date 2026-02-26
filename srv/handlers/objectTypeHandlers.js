const cds = require("@sap/cds");

// Deconstruction for clean entity access
// Note: ObjectType comes from the specific namespace you provided
const { ObjectType } = cds.entities("codeRules");

class ObjectTypeHandlers {
  /**
   * Generic Auth/Request logger for all incoming requests
   */
  static async onBeforeRequest(req) {
    console.log(
      `[AUTH_CHECK] Incoming request for event: ${req.event}, target: ${
        req.target ? req.target.name : "unknown"
      }`,
    );
    if (req.user) {
      console.log(
        "User credentials detected:\nID: ",
        req.user.id,
        "\nRoles: ",
        req.user.roles,
        "\nEmail: ",
        req.user.attr.email,
      );
    } else {
      console.log("Unauthenticated request received...");
    }
  }

  /**
   * Action: addProgrammableType
   */
  static async onAddProgrammableType(req) {
    const { code } = req.data;
    if (!code) return req.error(400, "Code parameter is required");

    const n = await UPDATE(ObjectType).set({ manual: false }).where({ code: code });
    if (n === 0) return req.error(404, `Object Type with code '${code}' not found.`);

    // Return null to force hard refresh as per original logic
    return;
  }

  /**
   * Action: makeManual (Bound to ObjectTypes)
   */
  static async onMakeManual(req) {
    const [key] = req.params;
    const code = key?.code;
    if (!code) return req.error(400, "Could not identify Object Type");

    const n = await UPDATE(ObjectType)
      .set({ manual: true, active: false })
      .where({ code: code });

    if (n === 0) return req.error(404, `Object Type with code '${code}' not found.`);

    return await SELECT.one.from(ObjectType).where({ code: code });
  }

  /**
   * Action: makeActive (Bound to ObjectTypes)
   */
  static async onMakeActive(req) {
    await cds.run(UPDATE(req.subject).with({ active: true }));
    const updatedObject = await cds.run(SELECT.one.from(req.subject));

    req.notify({
      message: `Successfully set ObjectType ${updatedObject.code} to active.`,
      type: "success",
    });

    return updatedObject;
  }

  /**
   * Action: makeInactive (Bound to ObjectTypes)
   */
  static async onMakeInactive(req) {
    await cds.run(UPDATE(req.subject).with({ active: false }));
    const updatedObject = await cds.run(SELECT.one.from(req.subject));

    req.notify({
      message: `Successfully set ObjectType ${updatedObject.code} to inactive.`,
      type: "success",
    });

    return updatedObject;
  }
}

module.exports = ObjectTypeHandlers;
