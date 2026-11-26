---
title: Demo key and roles
---
# Demo key and role boundaries

All `/v1/` endpoints require this public training header:

```http
X-Demo-Key: medilist-demo
```

`/health` is public. The key is published fixture data. It does not authenticate a person and grants no access to any external system.

## Read-only and documentation roles

| Header | Allowed actions |
| --- | --- |
| No `X-Demo-Role`, or `viewer` | Read lists, comparisons, reviews and events |
| `X-Demo-Role: reviewer` | The same reads, plus create and complete a documentation review |
| Any other role value | HTTP `403`, `ROLE_NOT_ALLOWED` |

A viewer's write request returns `403`, `REVIEWER_REQUIRED`. These freely selectable role headers demonstrate a documented API boundary; they are not a real authorization architecture. No login, consent, access token, profession or clinical permission is verified.

All events use the invented actor `reviewer-demo`. The event stream is an in-memory teaching record, not an immutable or regulatory audit log.

## In Postman

The collection puts `{{demo_key}}` in `X-Demo-Key`. Its reviewer requests explicitly add `X-Demo-Role: reviewer`. Negative requests override the role or omit authorization deliberately.

Do not put production credentials, patient identifiers or company data into this public learning project. The examples need only the supplied synthetic values.
