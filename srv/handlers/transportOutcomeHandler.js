const cds = require("@sap/cds");
const { TransportOutcome } = cds.entities("codeRules");

class TransportOutcomeHandler {
  /**
   * Action: addTransportOutcomes
   * Processes an array of transport results and persists them.
   */
  static async onAddTransportOutcomes(req) {
    console.log("addTransportOutcomes called");
    const { transportOutcomes } = req.data;

    if (!Array.isArray(transportOutcomes) || transportOutcomes.length === 0) {
      return req.error(400, "Outcomes must be a non-empty array");
    }

    let successful = 0;
    const failed = [];

    for (let i = 0; i < transportOutcomes.length; i++) {
      const entry = transportOutcomes[i];
      try {
        const { user_ID: user, transportRequest, failedChecks } = entry;

        if (!user || !transportRequest || failedChecks === undefined) {
          throw new Error(
            "Missing required fields: user, transportRequest, or failedChecks",
          );
        }

        const payload = {
          user_ID: user,
          transportRequest: transportRequest,
          failedChecks: failedChecks,
        };

        await cds.run(INSERT.into(TransportOutcome).entries(payload));
        successful++;
      } catch (err) {
        console.error(`Failed to process transportOutcome[${i}]:`, err.message);
        failed.push(i);
      }
    }

    const response = `${successful} of ${transportOutcomes.length} outcomes added successfully.`;
    return failed.length
      ? `${response} Failed indices: [${failed.join(", ")}]`
      : response;
  }
}

module.exports = TransportOutcomeHandler;
