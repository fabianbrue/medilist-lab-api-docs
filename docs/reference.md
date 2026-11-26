---
title: API reference
---
# API reference

Base URL: `http://127.0.0.1:4020`. Responses are JSON with `Cache-Control: no-store`. Paths and demo codes are case-sensitive. `/v1/` requests require the public demo key. No endpoint accepts query parameters.

The [OpenAPI contract](../api/openapi.json) provides complete object shapes and examples. This is a custom teaching model, not a representation of i.s.h.med, ePA or FHIR resources.

## GET /health

No key required. Returns `200` with `status`, `api`, `version` and `synthetic`.

## GET /v1/cases/{caseId}/medication-lists

Return the two unchanged source snapshots. The only fixture case is `case-demo-001`. A valid read returns `200`; an unknown case returns `404`, `CASE_NOT_FOUND`.

| Field | Meaning |
| --- | --- |
| `case_id` | Invented workflow case, not a patient or insurance identifier |
| `items[].id` | Identifier of one synthetic source list |
| `items[].source` | `hospital-demo` or `record-demo`; these are invented sources |
| `items[].version` | Positive integer source-snapshot version |
| `items[].captured_at` | Fixed synthetic snapshot timestamp |
| `items[].entries[].demo_item_code` | Exact comparison key; not a drug code system |
| `items[].entries[].display` | Explicitly fictional item label |
| `items[].entries[].source_record_id` | Invented source record reference, retained for traceability |

## GET /v1/cases/{caseId}/comparison

Return `200` with `source_versions`, `shared_codes`, `hospital_only_codes`, `record_only_codes`, `comparison_basis` and the two explicit flags `synthetic: true`, `clinical_validation_performed: false`.

`comparison_basis` is `exact_demo_item_code`. A shared code means that exact string occurs in both fixtures. It does not mean therapeutic equivalence. Codes present in one source are not recommendations to add, stop or change medication.

## POST /v1/reviews

Requires `reviewer` and `Content-Type: application/json`. Tie a new documentation review to the source versions you actually read:

```json
{
  "case_id": "case-demo-001",
  "source_versions": {"hospital-demo": 1, "record-demo": 1}
}
```

Exactly these fields and source keys are accepted. Source versions must be positive safe integers. A stale source snapshot returns `409`, `SOURCE_SNAPSHOT_CHANGED` without creating a review. An unknown case returns `404`.

Success: `201`, a `Location` pointing to the new review and an `ETag` such as `"1"`. The response object contains `id`, `case_id`, `source_versions`, `status`, `version`, `outcome`, `clinical_validation_performed` and `synthetic`.

Initial `status` is `open`, `version` is `1`, `outcome` is `null`. IDs increment within the current server process; do not hardcode a review ID in a reusable client.

Creating a review is not idempotent. Repeating this POST can create another review. The fixture has no idempotency-key mechanism and does not model a production retry policy.

## GET /v1/reviews/{reviewId}

Return the current review and its `ETag` with status `200`. After a server restart, earlier IDs no longer exist and return `404`, `REVIEW_NOT_FOUND`.

## POST /v1/reviews/{reviewId}/complete

Requires `reviewer`, JSON and `If-Match`. Use the current strong ETag, including its quotation marks:

```http
If-Match: "1"
Content-Type: application/json
```

```json
{"outcome":"documentation_complete"}
```

Only this outcome is supported. It records the completion of a **documentation task**, not a clinical or medication approval. There is no field for a dose, prescription decision or free-text clinical note.

Success: `200`, `status: documented`, incremented `version`, `outcome: documentation_complete`, `clinical_validation_performed: false` and a new `ETag`.

Missing precondition: `428`. Non-matching ETag: `412`. An already documented review with a matching current ETag: `409`. The server checks the precondition before parsing the body. A weak validator does not match. An `If-Match` list can match the current strong tag. `*` checks only that the resource exists, so use an explicit ETag for version-specific updates.

## GET /v1/reviews/{reviewId}/events

Return `200` with a review ID and `items` in event order. A new review has `review.created`; completing it appends `review.documented`.

| Event field | Meaning |
| --- | --- |
| `event_id` | Synthetic event sequence identifier |
| `review_id`, `case_id` | Teaching-record references |
| `action` | `review.created` or `review.documented` |
| `actor` | Fixed fictional actor `reviewer-demo` |
| `review_version` | Review version resulting from this event |
| `occurred_at` | Deterministic synthetic chronology, not wall-clock audit evidence |
| `synthetic` | Always `true` |

All writes and events are in memory. The API provides no persistence, clinical validation, patient lookup, source-list editing or external connectivity.
