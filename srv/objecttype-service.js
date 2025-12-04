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
    const [code] = req.params;

    try {
      await cds.run(UPDATE(ObjectTypes, code.code).with({ active: true }));
    } catch (err) {
      return req.error(
        400,
        `Could not make Object Type active: ${err.message}`
      );
    }
  });

  srv.on("makeInactive", ObjectTypes, async (req) => {
    const [code] = req.params;

    try {
      await cds.run(UPDATE(ObjectTypes, code.code).with({ active: false }));
    } catch (err) {
      return req.error(
        400,
        `Could not make Object Type active: ${err.message}`
      );
    }
  });
};
