---
title: Versioned documentation workflow
---
# Record a documentation task without losing its context

The workflow connects a source snapshot to an explicit documentation status. It never merges source lists or approves medication.

## 1. Read and retain the source versions

Read `/v1/cases/case-demo-001/medication-lists`. Both fixture sources currently have version `1`. The source versions and review version are different concepts: the former identify the list snapshots; the latter identifies the mutable documentation-review record.

## 2. Create a review

With the reviewer demo role, POST the documented body to `/v1/reviews`. Save the returned `id`, `Location` and `ETag` rather than inventing an ID.

```json
{"case_id":"case-demo-001","source_versions":{"hospital-demo":1,"record-demo":1}}
```

Expected: `201`; the review is `open`, version `1`.

## 3. Read the current state

GET the returned review URL. A second simulated client can use this endpoint to obtain the current representation and ETag. In Postman, requests 04 and 05 save these values for later numbered requests.

## 4. Record documentation completion

POST to the returned review URL followed by `/complete`, with the reviewer role, JSON body and current ETag in `If-Match`:

```json
{"outcome":"documentation_complete"}
```

Expected: `200`; `status` is `documented`, `version` is `2` and the ETag changes to `"2"`. `clinical_validation_performed` remains `false`.

## 5. Inspect the events

GET the review URL followed by `/events`. Expect `review.created` at version `1`, then `review.documented` at version `2`. This demonstrates traceable status changes in a teaching model, not a tamper-proof clinical audit service.

## A stale second client

If another request still sends `If-Match: "1"`, the response is `412`, `REVIEW_VERSION_CHANGED`. No event is added. Read the resource again and inspect its actual state before choosing another action. Sending the current `"2"` does not permit completing it twice: that returns `409`, `REVIEW_ALREADY_COMPLETE`.

Run the complete example with:

```sh
node examples/review-workflow.mjs
```

It creates a fresh in-memory review, records documentation completion and prints the resulting status and event actions. It performs no clinical assessment and changes no medication entry.

The conditional-request behaviour follows the technical concepts in [RFC 9110, If-Match](https://www.rfc-editor.org/rfc/rfc9110.html#name-if-match). The missing-precondition response uses [RFC 6585, 428](https://www.rfc-editor.org/rfc/rfc6585.html#section-3). No healthcare interoperability conformance follows from using these HTTP mechanisms.
