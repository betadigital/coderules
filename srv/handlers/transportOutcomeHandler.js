const cds = require("@sap/cds");
const { TransportOutcome } = cds.entities("codeRules");

class TransportOutcomeHandler {
  /**
   * Action: addTransportOutcomes
   * Processes an array of transport results and persists them.
   */
  static async onAddTransportOutcomes(req) {
    const { transportOutcomes } = req.data;

    if (!Array.isArray(transportOutcomes) || transportOutcomes.length === 0) {
      return req.error(400, "Outcomes must be a non-empty array");
    }
    let successful = 0;
    const failed = [];

    // Use a for...of loop for cleaner async/await syntax
    for (const [index, entry] of transportOutcomes.entries()) {
      try {
        const { user_ID, transportRequest, failedChecks } = entry;

        if (!user_ID || !transportRequest || failedChecks === undefined) {
          throw new Error("Missing required fields");
        }

        // Check for existing record by the unique business key
        const existing = await SELECT.one
          .from(TransportOutcome)
          .where({ transportRequest })
          .columns("ID");

        const payload = {
          user_ID,
          transportRequest,
          failedChecks,
        };

        if (existing) {
          // Update existing record
          await UPDATE(TransportOutcome)
            .set(payload)
            .where({ ID: existing.ID });
        } else {
          // Create new record
          await INSERT.into(TransportOutcome).entries(payload);
        }

        successful++;
      } catch (err) {
        console.error(`Error at index ${index}:`, err.message);
        failed.push(index);
      }
    }

    const message = `${successful} of ${transportOutcomes.length} outcomes processed.`;
    return failed.length > 0
      ? `${message} Failed indices: [${failed.join(", ")}]`
      : message;
  }
}

module.exports = TransportOutcomeHandler;
