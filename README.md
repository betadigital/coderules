# Deployment Guide for Code Review Rules CAP App

This guide explains how to deploy the CAP application to a **new BTP account** and set up **machine-to-machine (M2M) access** for backend services.

---

## Deployment on a New BTP Account

Follow these steps to deploy the application from scratch:

1. **Replace `mta.yaml`**  
   Replace the content of the project root `mta.yaml` with `util/mta.yaml`.  
   > This version will create all required services from scratch rather than relying on existing instances.

2. **Install dependencies and create initial deploy**  
   ```bash
   npm install
   npm run go

3. **Assign BTP roles**
    Go to your BTP cockpit and assign the desired roles to the front-end users of the application.
    Only users assigned RuleCreator or RuleAdmin will have write priviledges.

## Creating a Machine-to-Machine (M2M) Access Point

For automated clients (bots, scripts, or other systems) that need backend access **without logging in via the UI**, you need to create a service key with client credentials:

### Steps

1. **Create a new service key**  
   - Navigate to BTP → Subaccount → Instances & Subscriptions → XSUAA instance (e.g., `code-review-rules-auth` or `code-review-rules-xsuaa`).  
   - Create a new key named `m2m-key`.

2. **Copy the credentials**  
   - Once created, open the key JSON object.  
   - Note the `clientid`, `clientsecret`, and `url` fields.

3. **Grant M2M scope**  
   - Open `xs-security.json` in the project root.  
   - Find the `RuleM2M` scope in the `scopes` list and add the `clientid` to `grant-as-authority-to-apps`:
   {
     "name": "$XSAPPNAME.RuleM2M",
     "description": "M2M authorisation scope.",
     "grant-as-authority-to-apps": [
       "<YOUR-CLIENTID-HERE>"
     ]
   }

4. **Redeploy the app**  
   npm run go  
   > This will apply the updated scope configuration and make the M2M key functional.

---

## Notes

- All backend CAP services respect XSUAA scopes; ensure M2M clients have the required scope assigned.  
- For frontend users, role assignments in the cockpit control CRUD access.  
- Use the `m2m-key` for automated clients in your OAuth 2.0 **client credentials flow** to access backend APIs.
- under `utils/dev_xs-app.json`, there is a development and production routing configuration file. Using the dev version allows you to run production environment tests with a real approuter and backend service instance. See https://cap.cloud.sap/docs/node.js/authentication#running-app-router for more information on how to do this.