# How to Connect Tally to SharePoint via Webhook

This document explains how the Tally webhook integration works, how to configure Tally fields to map to SharePoint columns, how to use the mapping page, and how to run the test script.

---

## Overview

When a user submits a Tally form, Tally sends a webhook POST request to `/api/tally/`. The backend validates the payload, extracts the relevant fields, and creates a new item in a configured SharePoint list.

```text
Tally Form Submission
    → POST /api/tally/
    → Validate payload (Zod)
    → Filter fields with sh_ prefix
    → Encode field names for SharePoint
    → Microsoft Graph API
    → New SharePoint list item
```

---

## Environment Variables

The following variables must be set in `backend/.env` (or in Vercel environment settings for production):

```text
SHAREPOINT_TENANT=<Azure tenant ID>
SHAREPOINT_CLIENT_ID=<App registration client ID>
SHAREPOINT_CLIENT_SECRET=<App registration client secret>
SHAREPOINT_SITE_ID=<SharePoint site ID>
SHAREPOINT_LIST_ID=<SharePoint list ID>
```

The app registration in Azure AD must have the `Sites.ReadWrite.All` Microsoft Graph application permission granted.

---

## Mapping Tally Fields to SharePoint Columns

### The `sh_` prefix convention

The webhook only processes Tally fields whose **label** starts with `sh_`. All other fields are ignored.

The `sh_` prefix is stripped before storing. The remainder of the label is used as the SharePoint column name (after encoding — see below).

**Example:**

- Tally field label: `sh_Title` → stored in SharePoint column `Title`
- Tally field label: `sh_E-mail` → stored in SharePoint column `E-mail` (with `-` encoded)
- Tally field label: `sh_Prezývka` → stored in SharePoint column `Prezývka` (with `ý` encoded)

### Field name encoding

SharePoint internal column names only support a restricted character set. Non-alphanumeric characters (including accented and special characters) are encoded as `_x[4-digit-hex]_`.

Examples:

| Character | Encoded |
| ----------- | --------- |
| `-` (hyphen) | `_x002d_` |
| `ý` | `_x00fd_` |
| ň | `_x0148_` |
| ž | `_x017e_` |
| ` ` (space) | `_x0020_` |

This encoding is applied automatically. You do not need to handle it manually.

---

## Mapping Page

The mapping page at `/mapping` shows all available SharePoint columns and the exact label you need to use in Tally to target each one.

| Column | Description |
| -------- | ------------- |
| **Tally label (mapping name)** | The value to enter as the Tally field label (e.g. `sh_Title`) |
| **SharePoint display name** | The human-readable column name in SharePoint |
| **Group** | The column group in SharePoint |

The page filters out hidden, sealed, and built-in system columns, showing only custom columns that are safe to write to.

Use this page when adding new fields to a Tally form to find the correct `sh_` label for each SharePoint column.

---

## Webhook Endpoint

**Route:** `POST /api/tally/`

**Expected payload shape** (sent automatically by Tally):

```json
{
  "eventId": "...",
  "eventType": "FORM_RESPONSE",
  "createdAt": "...",
  "data": {
    "responseId": "...",
    "fields": [
      { "label": "sh_Title", "value": "Some value" },
      { "label": "sh_E-mail", "value": "user@example.com" },
      { "label": "OtherField", "value": "ignored" }
    ]
  }
}
```

**Responses:**

- `200 OK` — item created successfully in SharePoint
- `400 Bad Request` — payload does not match the expected schema
- `500 Internal Server Error` — SharePoint API error or server failure

---

## Test Script

`test-fields.ps1` sends each field from `test-fields-data.json` individually to the local webhook and reports which ones succeed or fail. This is useful for diagnosing field-level encoding or SharePoint column issues.

### Setup

1. Start the dev server:

   ```bash
   cd backend
   npm run dev
   ```

2. Populate `test-fields-data.json` with the fields you want to test (see structure below).

### Running the script

```powershell
cd backend
.\test-fields.ps1
```

The script targets `http://localhost:4321/api/tally/` by default.

### test-fields-data.json structure

```json
{
  "titleField": {
    "label": "sh_Title",
    "value": "TEST"
  },
  "testFields": [
    { "label": "sh_SomeColumn", "value": "some value" },
    { "label": "sh_AnotherColumn", "value": 42 }
  ]
}
```

- `titleField` — always included in every test request (acts as a required anchor field)
- `testFields` — each entry is tested in a separate request alongside `titleField`

### Output

```text
sh_SomeColumn ... OK (200)
sh_AnotherColumn ... FAIL (500)

Failed fields:
  - sh_AnotherColumn
```

If all individual field tests pass but a combined submission fails, the script reports a diagnostic message indicating the problem is likely due to field interactions rather than a single bad field.

---

## Configuring a Tally Form

1. Open the `/mapping` page to see available SharePoint columns and their `sh_` labels.
2. In Tally, set each field's **label** to the corresponding `sh_` value from the mapping page.
3. In Tally's **Integrations** settings, add a webhook pointing to your deployment URL:
   - Local: `http://localhost:4321/api/tally/`
   - Production: `https://<your-vercel-domain>/api/tally/`
4. Submit a test response and verify the item appears in SharePoint.

---

## Relevant Files

| File | Purpose |
| ------ | --------- |
| [src/pages/api/tally.ts](src/pages/api/tally.ts) | Webhook API route (entry point) |
| [src/lib/webhook.ts](src/lib/webhook.ts) | Core processing logic and SharePoint integration |
| [src/pages/mapping.astro](src/pages/mapping.astro) | Mapping page — lists available SharePoint columns |
| [test-fields.ps1](test-fields.ps1) | PowerShell test script for individual field testing |
| [test-fields-data.json](test-fields-data.json) | Test field data consumed by the test script |
| [`__tests__`/tally.test.ts](__tests__/tally.test.ts) | Unit tests for the webhook processing logic |
