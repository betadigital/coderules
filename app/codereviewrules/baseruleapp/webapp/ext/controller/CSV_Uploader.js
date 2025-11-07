sap.ui.define(
    ["sap/m/MessageToast", "sap/ui/core/Fragment"],
    function (MessageToast, Fragment) {
        "use strict";

        // Helper function to parse CSV text into a JSON array
        function parseCSV(text) {
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                throw new Error("CSV must have a header row and at least one data row.");
            }

            const headers = lines[0].split(',').map(h => h.trim());
            // These are the fields your BaseRule entity expects (excluding keys/managed fields)
            const requiredHeaders = ["description", "objectType", "ruleType", "value"];

            // Validate headers
            if (!requiredHeaders.every(h => headers.includes(h))) {
                throw new Error(`CSV headers must include: ${requiredHeaders.join(', ')}`);
            }

            const rulesArray = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                const rule = {};
                headers.forEach((header, index) => {
                    // Only map the fields that the entity actually has
                    if (requiredHeaders.includes(header)) {
                        rule[header] = values[index];
                    }
                });
                rulesArray.push(rule);
            }
            return rulesArray;
        }


        const handler = {
            // Renamed from attachPDF to attachCSV
            uploadCSV: function (oContext, aSelectedContexts) {
                console.log("Custom func 'attachCSV' invoked");

                // Keep a reference to this module (the 'handler' object)
                const that = handler;

                if (!that._fileUploadDialog) {
                    Fragment.load({

                        name: "baseruleapp.ext.fragment.CSV_Uploader",
                        controller: {
                            onFileSelected: that.onFileSelected.bind(that),
                            onUploadPressed: that.onUploadPressed.bind(that),
                            onCancelPressed: that.onCancelPressed.bind(that),
                        },
                    }).then(function (oDialog) {
                        that._fileUploadDialog = oDialog;
                        that._fileUploadDialog.open();
                    });
                } else {
                    that._fileUploadDialog.open();
                }
            },

            onFileSelected: function (oEvent) {
                // Get the Upload button from the dialog
                var oUploadButton = sap.ui.getCore().byId("uploadButton");
                // Enable the button if a file is selected
                oUploadButton.setEnabled(oEvent.getParameter("newValue") !== "");
            },

            onUploadPressed: async function (oEvent) {
                const that = handler; // Get reference to handler object
                const oFileUploader = sap.ui.getCore().byId("rulecsvUploader");
                const file = oFileUploader.oFileUpload && oFileUploader.oFileUpload.files[0];

                if (!file) {
                    MessageToast.show("Please select a CSV file first");
                    return;
                }

                // Ensure it's a CSV
                if (!file.name.toLowerCase().endsWith(".csv")) {
                    MessageToast.show("Please upload a valid CSV file");
                    return;
                }

                try {
                    // 1. Read the file as text
                    const text = await file.text();


                    const rulesArray = parseCSV(text);
                    if (rulesArray.length === 0) {
                        throw new Error("No data rows found in CSV.");
                    }

                    console.log(`Parsed ${rulesArray.length} rules from CSV.`);


                    // FETCH THE CSRF TOKEN
                    // We make a HEAD or GET request to the service root to get the token (might not be needed in prod?)
                    const tokenResponse = await fetch("/baseRuleService/", { // Target your service root
                        method: "HEAD",
                        headers: {
                            "X-CSRF-Token": "Fetch"
                        }
                    });

                    if (!tokenResponse.ok) {
                        throw new Error(`Failed to fetch CSRF token: ${tokenResponse.statusText}`);
                    }

                    const csrfToken = tokenResponse.headers.get("x-csrf-token");
                    if (!csrfToken) {
                        throw new Error("Could not retrieve CSRF token from response.");
                    }


                    const response = await fetch("/baseRuleService/fileUploadBaseRules", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-Token": csrfToken
                        },
                        body: JSON.stringify({
                            rules: JSON.stringify(rulesArray), // Double stringify as per your action definition
                        }),
                    });

                    if (!response.ok) {
                        const errText = await response.text();
                        console.error("Backend error:", errText);
                        throw new Error(`Backend error: ${response.status} - ${errText}`);
                    }

                    const resultText = await response.text(); // Get the success message
                    MessageToast.show(resultText);

                    // 4. Close and reset
                    that._fileUploadDialog.close();
                    oFileUploader.clear();
                    // You might need to refresh the main table here, e.g.:
                    // this.getView().byId("your-main-table-id").rebindTable();

                } catch (err) {
                    console.error("Error processing file:", err);
                    MessageToast.show(`Error: ${err.message}`);
                }
            },

            onCancelPressed: function () {
                console.log("Cancelling..");
                const oFileUploader = sap.ui.getCore().byId("rulecsvUploader");
                handler._fileUploadDialog.close();
                oFileUploader.clear();
                // Also reset the upload button
                sap.ui.getCore().byId("uploadButton").setEnabled(false);
            },
        };

        return handler;
    }
);