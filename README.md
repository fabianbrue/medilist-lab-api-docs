# MediList Lab — medication-list API documentation

**Status: learning scaffold, version 0.1.0. Not a completed portfolio submission.**

[Public documentation](https://fabianbrue.github.io/medilist-lab-api-docs/) · [GitHub repository](https://github.com/fabianbrue/medilist-lab-api-docs) · [LinkedIn draft](learning/LINKEDIN.md)

An independent, AI-assisted documentation learning project inspired by the *type of information-flow challenges* found in healthcare software: source provenance, list differences, documentation status, version conflicts and traceable events.

This is an original teaching API. It does not implement an Oracle Health, i.s.h.med, German ePA or FHIR interface, and makes no interoperability or compliance claim. All identifiers, item names, sources and timestamps are synthetic. No real drugs, doses, patient records or internal product material are used. Recording a documentation status is not a medication approval or a clinical assessment.

## What the example does

1. Read two synthetic source lists for `case-demo-001`.
2. Compare the presence of exact demo codes while retaining their source versions.
3. Create an in-memory documentation review using the `reviewer` demo role.
4. Record `documentation_complete` using the review's current ETag.
5. Inspect the two resulting synthetic events and their source snapshot.

The review cannot change a medication entry, prescribe anything or certify that two medicines are equivalent. The local fixed demo key and role header are training controls, not an identity or access-management implementation.

## Run

Requirements: Node.js 22 or newer; PowerShell 7 for building the documentation. No npm packages or real credentials are required.

```sh
node --test
node scripts/check.mjs
pwsh -NoProfile -File scripts/build-docs.ps1
node src/server.mjs
```

Open <http://127.0.0.1:4020/>. Stop with Ctrl+C. Restarting discards every review and event. Set `PORT` if needed, then adjust Postman `base_url`. The workstation helper is `api-doc-kurs/Medikationsprojekt-starten.cmd` in the sibling course folder; it is not part of this publishable repository.

## Start points

- [Projektauftrag und Lernplan](learning/PROJECT_BRIEF.md) — your own tasks and evidence.
- [Developer guide](docs/index.md) and [quickstart](docs/quickstart.md).
- [Workflow tutorial](docs/workflow.md), [reference](docs/reference.md), [errors](docs/errors.md).
- [OpenAPI 3.0.3](api/openapi.json) and the importable [Postman collection](postman/medilist.postman_collection.json) / [environment](postman/medilist.postman_environment.json).
- [Case study and authorship](docs/case-study.md), [verification](docs/verification.md), [publication](learning/PUBLISHING.md), [LinkedIn draft](learning/LINKEDIN.md).

`docs/` contains authoritative Markdown; `_site/` is generated and ignored. GitHub Pages serves static documentation only. Run the Node.js API locally; Postman web users need a Desktop Agent to reach loopback addresses.

Codex supplied the initial implementation, fixtures, contract, documentation and tests. Learner review and final case study are still pending. Describe your actual contributions and verified revisions before calling this a completed portfolio. The project is not an employer deliverable, product description, medical recommendation or certificate.

The original independent hiking example remains a separate project. This repository contains only the healthcare-themed learning example. See [Tom Johnson's course](https://idratherbewriting.com/learnapidoc/) for its learning context.
