---
title: Quickstart
---
# Read your first synthetic medication lists

This guide gets you to a successful read. The [workflow tutorial](workflow.md) then adds a versioned documentation-status change.

Requirements: Node.js 22 or newer, a checkout of this repository and curl or the Postman desktop app. PowerShell 7 is needed only to build the website. No registration, real credentials or clinical system is needed.

## Start the demo

```sh
node src/server.mjs
```

Keep this terminal open. In another terminal:

```sh
curl "http://127.0.0.1:4020/health"
```

In Windows PowerShell, use `curl.exe` instead of `curl`. Expected response: HTTP `200`, with `api` equal to `MediList Lab` and `synthetic` equal to `true`.

If port 4020 is occupied, select another `PORT` and update every request and Postman `base_url`. A connection failure is not a JSON API error.

## Read both source lists

```sh
curl "http://127.0.0.1:4020/v1/cases/case-demo-001/medication-lists" -H "X-Demo-Key: medilist-demo"
```

Expected: HTTP `200` with two `items`:

| Source | Version | Demo codes |
| --- | --- | --- |
| `hospital-demo` | `1` | `DEMO-ALPHA`, `DEMO-BETA` |
| `record-demo` | `1` | `DEMO-ALPHA`, `DEMO-GAMMA` |

Each entry retains its `source_record_id`. The response does not merge, rank or correct the source records. `captured_at` timestamps describe the invented fixture snapshots, not a live clinical refresh.

## Compare their code presence

```sh
curl "http://127.0.0.1:4020/v1/cases/case-demo-001/comparison" -H "X-Demo-Key: medilist-demo"
```

Expected: `shared_codes` contains Alpha, `hospital_only_codes` contains Beta and `record_only_codes` contains Gamma. `clinical_validation_performed` is `false`.

These are exact-code set differences. They do not show equivalent medicines, interactions, duplicate therapy, adherence or what someone should take.

## Postman

1. Import the [collection](../postman/medilist.postman_collection.json) and [environment](../postman/medilist.postman_environment.json).
2. Select **MediList Lab — local synthetic demo**.
3. Start with requests 01–03. Run the numbered collection in order to demonstrate the full review workflow and its expected negative cases.

The desktop app can reach your local API. The web app needs a connected Desktop Agent; a Cloud Agent cannot contact your loopback address. The collection stores `review_id` and `review_etag` as collection variables during the workflow. Do not shadow them with environment variables.

## Try the local workflow console

The console is enabled only in the local HTTP preview. The published site does not contact a clinical system or a reader's computer.

<form data-demo-console>
<label for="demo-role">Public demo role</label>
<select id="demo-role" name="role"><option value="viewer">viewer — read only</option><option value="reviewer">reviewer — documentation changes</option></select>
<label for="request-case">Request</label>
<select id="request-case" name="request"><option value="lists">Read source lists</option><option value="comparison">Compare demo codes</option><option value="create">Create a documentation review</option><option value="read">Read the current review</option><option value="complete">Record documentation complete</option><option value="events">Read review events</option><option value="stale">Demonstrate a stale ETag (412)</option></select>
<button type="submit">Send local request</button>
<p data-console-status role="status">Start the local demo. All records and actions are synthetic.</p>
<pre data-console-output aria-live="polite">No request sent.</pre>
</form>
