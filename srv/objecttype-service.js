const cds = require("@sap/cds");
const { UPDATE, SELECT } = require("@sap/cds/lib/ql/cds-ql");

module.exports = (srv) => {
  const { ObjectTypes } = srv.entities;
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

  srv.on("makeActive", ObjectTypes, async (req) => {
    await cds.run(UPDATE(req.subject).with({ active: true }));

    const updatedObject = await cds.run(SELECT.one.from(req.subject));

    req.notify({
      message: `Successfully set ObjectType ${updatedObject.code} to active.`,
      type: "success",
    });

    return updatedObject;
  });

  srv.on("makeActive", ObjectTypes, async (req) => {
    await cds.run(UPDATE(req.subject).with({ active: false }));

    const updatedObject = await cds.run(SELECT.one.from(req.subject));

    req.notify({
      message: `Successfully set ObjectType ${updatedObject.code} to inactive.`,
      type: "success",
    });

    return updatedObject;
  });
};
