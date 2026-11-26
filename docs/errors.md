---
title: Errors and version conflicts
---
# Errors and version conflicts

Errors use `{"error":{"code":"...","message":"..."}}`. Treat the HTTP status and error code as the identifiers. The message explains the demo's current failure.

| Status | Code | Meaning and recovery |
| --- | --- | --- |
| 400 | `INVALID_JSON` | Send one well-formed JSON object |
| 400 | `INVALID_BODY` | Use exactly the documented fields and source-version types |
| 400 | `INVALID_OUTCOME` | Only `documentation_complete` is accepted; no clinical approval is modelled |
| 400 | `QUERY_NOT_SUPPORTED` | Remove query parameters |
| 401 | `UNAUTHORIZED` | Supply the public `X-Demo-Key: medilist-demo` header |
| 403 | `ROLE_NOT_ALLOWED` | Use `viewer` or `reviewer` |
| 403 | `REVIEWER_REQUIRED` | The action changes documentation status and requires the reviewer demo role |
| 404 | `CASE_NOT_FOUND` | Use `case-demo-001` |
| 404 | `REVIEW_NOT_FOUND` | Check the returned ID; reviews are lost on restart |
| 404 | `NOT_FOUND` | Check the path or build the documentation site |
| 405 | `METHOD_NOT_ALLOWED` | Use the method advertised in `Allow` |
| 409 | `SOURCE_SNAPSHOT_CHANGED` | Read source lists again and use their versions when creating a review |
| 409 | `REVIEW_ALREADY_COMPLETE` | The record is already documented; do not complete it twice |
| 412 | `REVIEW_VERSION_CHANGED` | Read the current review and inspect its state before retrying |
| 413 | `BODY_TOO_LARGE` | The demo limits JSON bodies to 8192 bytes |
| 415 | `JSON_REQUIRED` | Send `Content-Type: application/json` |
| 428 | `IF_MATCH_REQUIRED` | GET the review and send its ETag in `If-Match` |

Write permission is checked before a body is read. For completion, an unknown review is checked before the precondition, and a stale ETag before the already-complete state. This ordering makes the negative examples repeatable.

No clinical alert, interaction warning, medication duplication assessment, consent denial, insurance lookup or real ePA access error is simulated. Do not infer those product behaviours from this example.
