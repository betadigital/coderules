const cds = require("@sap/cds");
const { UPDATE, SELECT } = require("@sap/cds/lib/ql/cds-ql");

module.exports = (srv) => {
  const { ObjectTypes, ManualObjectTypes } = srv.entities;
  const { ObjectType } = cds.entities("codeRules");
  srv.before("*", async (req) => {
    // This logs the event (e.g., CREATE, READ, uploadBaseRules) and the target entity
    console.log(
      `[AUTH_CHECK] Incoming request for event: ${req.event}, target: ${
        req.target ? req.target.name : "unknown"
      }`
    );
    if (req.user) {
      console.log(
        "User credentials detected on HTTP request. See below:\nID: ",
        req.user.id,
        "\nRoles: ",
        req.user.roles,
        "\nEmail: ",
        req.user.attr.email
      );
    } else {
      console.log("Unauthenticated request received...");
    }
  });

  /**
   * Action: addProgrammableType
   * Logic: Flips 'manual' to false, effectively moving it to the Programmable list.
   */
  srv.on("addProgrammableType", async (req) => {
    const { code } = req.data;

    if (!code) return req.error(400, "Code parameter is required");

    const n = await UPDATE(ObjectType).set({ manual: false }).where({ code: code });

    if (n === 0) {
      return req.error(404, `Object Type with code '${code}' not found.`);
    }

    const retVal = await SELECT.one.from(ObjectType).where({ code: code });
    console.log(retVal);
    // Return null to force hard refresh
    return;
  });

  /**
   * Opposite to add programmable type.
   */
  srv.on("makeManual", "ObjectTypes", async (req) => {
    const [key] = req.params;
    const code = key.code;

    if (!code) return req.error(400, "Could not identify Object Type");

    // 1. Set manual = true (moves it back to Manual pool)
    // 2. Set active = false (may need to change to true depending on desired spec)
    const n = await UPDATE(ObjectType)
      .set({ manual: true, active: false })
      .where({ code: code });

    if (n === 0) return req.error(404, `Object Type with code '${code}' not found.`);

    return await SELECT.one.from(ObjectType).where({ code: code });
  });

  /**
   * Makes an object type active (active means we check against this rule)
   */
  srv.on("makeActive", ObjectTypes, async (req) => {
    await cds.run(UPDATE(req.subject).with({ active: true }));

    const updatedObject = await cds.run(SELECT.one.from(req.subject));

    req.notify({
      message: `Successfully set ObjectType ${updatedObject.code} to active.`,
      type: "success",
    });

    return updatedObject;
  });

  /**
   * Makes an object type inactive (inactive means it is auto-approved, and not check against)
   */
  srv.on("makeInactive", ObjectTypes, async (req) => {
    await cds.run(UPDATE(req.subject).with({ active: false }));

    const updatedObject = await cds.run(SELECT.one.from(req.subject));

    req.notify({
      message: `Successfully set ObjectType ${updatedObject.code} to inactive.`,
      type: "success",
    });

    return updatedObject;
  });
};
