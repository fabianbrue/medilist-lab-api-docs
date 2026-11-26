import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function runWorkflow(baseUrl = 'http://127.0.0.1:4020') {
  async function request(path, { method = 'GET', body, etag } = {}) {
    const response = await fetch(new URL(path, baseUrl), {
      method, headers: { 'X-Demo-Key': 'medilist-demo', 'X-Demo-Role': 'reviewer',
        ...(body && { 'Content-Type': 'application/json' }), ...(etag && { 'If-Match': etag }) },
      body: body && JSON.stringify(body)
    });
    const value = await response.json();
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${JSON.stringify(value)}`);
    return { value, etag: response.headers.get('etag') };
  }
  const lists = (await request('/v1/cases/case-demo-001/medication-lists')).value;
  const source_versions = Object.fromEntries(lists.items.map(list => [list.source, list.version]));
  const comparison = (await request('/v1/cases/case-demo-001/comparison')).value;
  assert.equal(comparison.clinical_validation_performed, false);
  const created = await request('/v1/reviews', { method: 'POST', body: { case_id: lists.case_id, source_versions } });
  const path = '/v1/reviews/' + created.value.id;
  const current = await request(path);
  const completed = await request(path + '/complete', { method: 'POST', etag: current.etag, body: { outcome: 'documentation_complete' } });
  const events = (await request(path + '/events')).value;
  assert.equal(completed.value.status, 'documented');
  assert.equal(completed.value.clinical_validation_performed, false);
  assert.deepEqual(events.items.map(event => event.action), ['review.created', 'review.documented']);
  return { review_id: created.value.id, status: completed.value.status,
    clinical_validation_performed: false, source_versions, events: events.items.map(event => event.action) };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await runWorkflow(process.env.MEDILIST_BASE_URL), null, 2));
}
