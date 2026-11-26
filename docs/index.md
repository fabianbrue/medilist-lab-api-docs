---
title: MediList Lab
---
# Medication lists. Traceable documentation.

MediList Lab is an independent API-documentation learning project for a fictional healthcare integration scenario. It lets a developer read two synthetic medication-list snapshots, inspect differences in their item codes and record the completion of a documentation task.

The scenario is closer to healthcare documentation work than a generic catalogue API: provenance, source versions, role boundaries, state transitions and conflicting updates all need to be explained precisely.

## What is real, and what is simulated?

The HTTP server, examples, contract and tests run. The case, list sources, item names, versions and event chronology are invented. Items called `DEMO-ALPHA`, `DEMO-BETA` and `DEMO-GAMMA` are not medicines. There are no names, dates of birth, insurance identifiers, doses or clinical instructions.

This is not an Oracle Health, i.s.h.med, ePA or FHIR API. It is not an employer deliverable, product integration, clinical assessment or compliance demonstration.

## Follow one case through the workflow

1. Read the two source lists for `case-demo-001`.
2. Compare the presence of exact demo codes without changing either list.
3. Create an `open` review tied to the source versions you read.
4. Record `documentation_complete` using the current review version.
5. Read the events that explain when the synthetic documentation status changed.

The final review status is `documented`. This does **not** mean clinically reviewed, reconciled, approved, prescribed or safe. The API never updates medication entries.

## Choose your next step

| Developer task | Guide |
| --- | --- |
| Make a first request | [Quickstart](quickstart.md) |
| Understand read and write permissions | [Demo roles](authentication.md) |
| Inspect paths, bodies and response fields | [API reference](reference.md) |
| Complete a versioned documentation task | [Review workflow](workflow.md) |
| Recover from stale versions | [Errors and conflicts](errors.md) |
| Assess the evidence and limitations | [Verification](verification.md) and [case study](case-study.md) |

## Supporting files

- [OpenAPI 3.0.3 contract](../api/openapi.json)
- [Postman collection](../postman/medilist.postman_collection.json)
- [Postman environment](../postman/medilist.postman_environment.json)

The local base URL is `http://127.0.0.1:4020`. GitHub Pages serves documentation only. Run the API on your computer; reviews and events disappear on restart.
