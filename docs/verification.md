---
title: Verification and limits
---
# Verify a documentation workflow

From the repository root:

```sh
node --test
node scripts/check.mjs
pwsh -NoProfile -File scripts/build-docs.ps1
node scripts/check.mjs --site
```

The integration suite starts isolated local servers and tests list provenance, exact-code comparison, reviewer boundaries, creation, ETags, stale and concurrent writes, duplicate completion, event ordering and input failures. It also executes the tutorial workflow and all twelve Postman HTTP examples using a minimal assertion adapter. Importing and running the collection in the actual Postman app remains a learner task. These tests do not validate medical correctness or an Oracle/ePA integration.

The artifact checker resolves local contract references, matches methods and path parameters, checks Postman variables and JavaScript syntax and verifies documentation links. This targeted checker is not a full OpenAPI standards validator; import the contract into Swagger Editor as part of your own course exercise.

## Reader review tasks

1. Identify which source contains `DEMO-BETA`, and show the source record reference.
2. Explain why a matching code does not imply therapeutic equivalence.
3. Create a review as a reviewer, complete the documentation task and show both events.
4. Reproduce a stale ETag response and explain why blindly retrying would be wrong.
5. Explain why `documented` is not clinical approval and why the demo headers are not real access control.

Record actual observations, dates and revisions in the learning evidence file. Do not report a reader study, product conformance or course completion before it has happened.

## Explicit limits

In-memory records; fixed source fixtures; no source updates; no consent or patient-identity model; no external connections; no real drugs or doses; no FHIR/ePA schema validation; no clinical decisions; no immutable or regulatory audit logging. A public static site serves documentation only; the request console works locally.
