import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from '../src/server.mjs';
import { runWorkflow } from '../examples/review-workflow.mjs';

let server, base;
beforeEach(async () => { server = createServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening'); base = `http://127.0.0.1:${server.address().port}`; });
afterEach(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
const source = { 'hospital-demo': 1, 'record-demo': 1 };
async function call(path, { method = 'GET', role = 'reviewer', key = 'medilist-demo', body, headers = {} } = {}) {
  const response = await fetch(base + path, { method, headers: { ...(key && { 'X-Demo-Key': key }), 'X-Demo-Role': role,
    ...(body !== undefined && { 'Content-Type': 'application/json' }), ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, headers: response.headers, body: await response.json() };
}
const create = (options = {}) => call('/v1/reviews', { method: 'POST', body: { case_id: 'case-demo-001', source_versions: source }, ...options });
const complete = (id, etag = '"1"', options = {}) => call(`/v1/reviews/${id}/complete`, { method: 'POST', body: { outcome: 'documentation_complete' }, headers: etag ? { 'If-Match': etag } : {}, ...options });
async function error(result, status, code) { assert.equal(result.status, status); assert.equal(result.body.error.code, code); }

test('health is unauthenticated and synthetic', async () => { const r = await call('/health', { key: null }); assert.equal(r.status, 200); assert.equal(r.body.api, 'MediList Lab'); assert.equal(r.body.synthetic, true); });
test('source snapshots preserve entry provenance', async () => {
  const r = await call('/v1/cases/case-demo-001/medication-lists', { role: 'viewer' });
  assert.equal(r.status, 200); assert.equal(r.body.items.length, 2);
  assert.deepEqual(Object.fromEntries(r.body.items.map(x => [x.source, x.version])), source);
  assert.ok(r.body.items.every(list => list.synthetic && list.entries.every(entry => entry.source_record_id && entry.display.includes('not a drug'))));
});
test('comparison only reports exact synthetic code presence', async () => {
  const r = await call('/v1/cases/case-demo-001/comparison');
  assert.equal(r.status, 200); assert.deepEqual(r.body.shared_codes, ['DEMO-ALPHA']);
  assert.deepEqual(r.body.hospital_only_codes, ['DEMO-BETA']); assert.deepEqual(r.body.record_only_codes, ['DEMO-GAMMA']);
  assert.equal(r.body.clinical_validation_performed, false);
});
test('missing and incorrect public demo keys are rejected', async () => { for (const key of [null, 'wrong']) await error(await call('/v1/reviews', { method: 'POST', key }), 401, 'UNAUTHORIZED'); });
test('viewer cannot write and arbitrary roles are rejected', async () => { await error(await create({ role: 'viewer' }), 403, 'REVIEWER_REQUIRED'); await error(await create({ role: 'admin' }), 403, 'ROLE_NOT_ALLOWED'); });
test('creation returns Location, ETag and the requested snapshot', async () => {
  const r = await create(); assert.equal(r.status, 201); assert.equal(r.headers.get('etag'), '"1"');
  assert.equal(r.headers.get('location'), '/v1/reviews/' + r.body.id); assert.deepEqual(r.body.source_versions, source);
  assert.equal(r.body.status, 'open'); assert.equal(r.body.outcome, null); assert.equal(r.body.clinical_validation_performed, false);
});
test('stale source snapshot cannot create a review or consume an id', async () => {
  await error(await create({ body: { case_id: 'case-demo-001', source_versions: { ...source, 'record-demo': 2 } } }), 409, 'SOURCE_SNAPSHOT_CHANGED');
  const r = await create(); assert.equal(r.body.id, 'review-demo-0001');
  const events = await call(`/v1/reviews/${r.body.id}/events`); assert.equal(events.body.items.length, 1);
});
test('JSON type, shape, fields and version types are validated', async () => {
  for (const body of [[], null, {}, { case_id: 2, source_versions: source }, { case_id: 'case-demo-001', source_versions: { ...source, extra: 1 } }, { case_id: 'case-demo-001', source_versions: { ...source, 'record-demo': '1' } }]) assert.equal((await create({ body })).status, 400);
  const malformed = await fetch(base + '/v1/reviews', { method: 'POST', headers: { 'X-Demo-Key': 'medilist-demo', 'X-Demo-Role': 'reviewer', 'Content-Type': 'application/json' }, body: '{' }); assert.equal(malformed.status, 400); await malformed.text();
});
test('content type and body size errors are returned as JSON', async () => {
  await error(await create({ headers: { 'Content-Type': 'text/plain' } }), 415, 'JSON_REQUIRED');
  await error(await create({ body: { padding: 'x'.repeat(9000) } }), 413, 'BODY_TOO_LARGE');
});
test('unknown cases and reviews have distinct errors', async () => { await error(await call('/v1/cases/missing/medication-lists'), 404, 'CASE_NOT_FOUND'); await error(await call('/v1/reviews/missing'), 404, 'REVIEW_NOT_FOUND'); });
test('completion requires the current strong ETag', async () => {
  const { body: review } = await create();
  await error(await complete(review.id, null), 428, 'IF_MATCH_REQUIRED');
  await error(await complete(review.id, '"0"'), 412, 'REVIEW_VERSION_CHANGED');
  await error(await complete(review.id, 'W/"1"'), 412, 'REVIEW_VERSION_CHANGED');
  assert.equal((await call(`/v1/reviews/${review.id}/events`)).body.items.length, 1);
});
test('only a documentation outcome is supported', async () => {
  const { body: review } = await create();
  await error(await complete(review.id, '"1"', { body: { outcome: 'medication_approved' } }), 400, 'INVALID_OUTCOME');
  assert.equal((await call(`/v1/reviews/${review.id}`)).headers.get('etag'), '"1"');
});
test('completion changes review version and events, preserving source lists', async () => {
  const before = await call('/v1/cases/case-demo-001/medication-lists');
  const { body: review } = await create(); const r = await complete(review.id);
  assert.equal(r.status, 200); assert.equal(r.headers.get('etag'), '"2"'); assert.equal(r.body.status, 'documented'); assert.equal(r.body.outcome, 'documentation_complete'); assert.equal(r.body.clinical_validation_performed, false);
  const events = (await call(`/v1/reviews/${review.id}/events`)).body.items;
  assert.deepEqual(events.map(x => x.action), ['review.created', 'review.documented']); assert.deepEqual(events.map(x => x.review_version), [1, 2]);
  assert.ok(events.every(x => x.synthetic && x.actor === 'reviewer-demo')); assert.ok(events[0].occurred_at < events[1].occurred_at);
  assert.deepEqual((await call('/v1/cases/case-demo-001/medication-lists')).body, before.body);
});
test('a strong tag in a list satisfies If-Match', async () => { const { body: review } = await create(); assert.equal((await complete(review.id, '"0", "1"')).status, 200); });
test('wildcard matches the existing review', async () => { const { body: review } = await create(); assert.equal((await complete(review.id, '*')).status, 200); });
test('stale retry is 412; duplicate with current tag is 409', async () => {
  const { body: review } = await create(); await complete(review.id);
  await error(await complete(review.id), 412, 'REVIEW_VERSION_CHANGED'); await error(await complete(review.id, '"2"'), 409, 'REVIEW_ALREADY_COMPLETE');
  assert.equal((await call(`/v1/reviews/${review.id}/events`)).body.items.length, 2);
});
test('concurrent completions with the same ETag produce one change', async () => {
  const { body: review } = await create();
  const results = await Promise.all([complete(review.id), complete(review.id)]);
  assert.deepEqual(results.map(x => x.status).sort(), [200, 412]);
  assert.equal((await call(`/v1/reviews/${review.id}/events`)).body.items.length, 2);
});
test('unsupported queries and methods are explicit', async () => {
  await error(await call('/v1/cases/case-demo-001/comparison?sort=name'), 400, 'QUERY_NOT_SUPPORTED');
  const r = await call('/v1/reviews', { method: 'GET' }); assert.equal(r.status, 405); assert.equal(r.headers.get('allow'), 'POST');
});
test('new server has no state from the previous instance', async () => {
  const { body: review } = await create(); const fresh = createServer(); fresh.listen(0, '127.0.0.1'); await once(fresh, 'listening');
  try { const r = await fetch(`http://127.0.0.1:${fresh.address().port}/v1/reviews/${review.id}`, { headers: { 'X-Demo-Key': 'medilist-demo' } }); assert.equal(r.status, 404); await r.text(); }
  finally { fresh.closeAllConnections(); await new Promise(resolve => fresh.close(resolve)); }
});
test('published runnable workflow exercises the whole sequence', async () => { const result = await runWorkflow(base); assert.equal(result.status, 'documented'); assert.equal(result.events.length, 2); assert.equal(result.clinical_validation_performed, false); });
