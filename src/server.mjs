import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
import { CASE_ID, medicationLists, sourceVersions, compareLists } from './data.mjs';

export const DEMO_KEY = 'medilist-demo'; // Public training value, not a real credential.
const siteRoot = fileURLToPath(new URL('../_site/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8' };
class Failure extends Error { constructor(status, code, message) { super(message); this.status = status; this.code = code; } }
const fail = (status, code, message) => { throw new Failure(status, code, message); };
function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(body, null, 2));
}
async function body(req) {
  if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') fail(415, 'JSON_REQUIRED', 'Send Content-Type: application/json.');
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size <= 8192) chunks.push(chunk);
  }
  if (size > 8192) fail(413, 'BODY_TOO_LARGE', 'The demo accepts at most 8192 request-body bytes.');
  try { const value = JSON.parse(Buffer.concat(chunks).toString('utf8')); if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error(); return value; }
  catch { fail(400, 'INVALID_JSON', 'Send one JSON object.'); }
}
function fields(value, required) {
  if (Object.keys(value).length !== required.length || required.some(key => !Object.hasOwn(value, key))) fail(400, 'INVALID_BODY', 'Use exactly the documented request fields.');
}
const etag = review => `"${review.version}"`;
export function createServer() {
  const reviews = new Map();
  const events = new Map();
  let nextId = 1;
  let nextEvent = 1;
  function audit(review, action) {
    const sequence = nextEvent++;
    const entry = { event_id: `event-demo-${String(sequence).padStart(4, '0')}`, review_id: review.id, case_id: review.case_id, action, actor: 'reviewer-demo', review_version: review.version, occurred_at: new Date(Date.UTC(2026, 0, 1, 10, 0, sequence)).toISOString(), synthetic: true };
    events.get(review.id).push(entry);
  }
  return http.createServer(async (req, res) => {
    try {
      let url;
      try { url = new URL(req.url, 'http://localhost'); } catch { fail(400, 'INVALID_URL', 'Invalid request URL.'); }
      const path = url.pathname;
      if (path === '/health') {
        if (req.method !== 'GET') return send(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET.' } }, { Allow: 'GET' });
        if (url.search) fail(400, 'QUERY_NOT_SUPPORTED', 'These demo endpoints do not accept query parameters.');
        return send(res, 200, { status: 'ok', api: 'MediList Lab', version: '0.1.0', synthetic: true });
      }
      if (path.startsWith('/v1/')) {
        if (req.headers['x-demo-key'] !== DEMO_KEY) fail(401, 'UNAUTHORIZED', 'Provide X-Demo-Key: medilist-demo.');
        const role = req.headers['x-demo-role'] ?? 'viewer';
        if (!['viewer', 'reviewer'].includes(role)) fail(403, 'ROLE_NOT_ALLOWED', 'Use the public demo role viewer or reviewer.');
        const matchLists = /^\/v1\/cases\/([^/]+)\/medication-lists$/.exec(path);
        const matchComparison = /^\/v1\/cases\/([^/]+)\/comparison$/.exec(path);
        const matchReview = /^\/v1\/reviews\/([^/]+)(?:\/(complete|events))?$/.exec(path);
        const create = path === '/v1/reviews';
        if (!matchLists && !matchComparison && !matchReview && !create) fail(404, 'NOT_FOUND', 'No endpoint matches this path.');
        const method = create || matchReview?.[2] === 'complete' ? 'POST' : 'GET';
        if (req.method !== method) return send(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: `Use ${method}.` } }, { Allow: method });
        if (url.search) fail(400, 'QUERY_NOT_SUPPORTED', 'These demo endpoints do not accept query parameters.');
        if (method === 'POST' && role !== 'reviewer') fail(403, 'REVIEWER_REQUIRED', 'Use X-Demo-Role: reviewer for documentation-status changes.');
        if (matchLists || matchComparison) {
          if ((matchLists ?? matchComparison)[1] !== CASE_ID) fail(404, 'CASE_NOT_FOUND', 'No synthetic case matches this id.');
          return send(res, 200, matchLists ? { case_id: CASE_ID, items: medicationLists, synthetic: true } : compareLists());
        }
        if (create) {
          const value = await body(req);
          fields(value, ['case_id', 'source_versions']);
          if (typeof value.case_id !== 'string') fail(400, 'INVALID_BODY', 'case_id must be a string.');
          if (value.case_id !== CASE_ID) fail(404, 'CASE_NOT_FOUND', 'No synthetic case matches this id.');
          const versions = value.source_versions;
          if (!versions || Array.isArray(versions) || typeof versions !== 'object') fail(400, 'INVALID_BODY', 'source_versions must be an object.');
          fields(versions, ['hospital-demo', 'record-demo']);
          if (Object.values(versions).some(version => !Number.isSafeInteger(version) || version < 1)) fail(400, 'INVALID_BODY', 'Use positive integer source versions.');
          if (Object.entries(sourceVersions).some(([source, version]) => versions[source] !== version)) fail(409, 'SOURCE_SNAPSHOT_CHANGED', 'Read the source lists again and use their current versions.');
          const review = { id: `review-demo-${String(nextId++).padStart(4, '0')}`, case_id: CASE_ID, source_versions: { ...sourceVersions }, status: 'open', version: 1, outcome: null, clinical_validation_performed: false, synthetic: true };
          reviews.set(review.id, review);
          events.set(review.id, []);
          audit(review, 'review.created');
          return send(res, 201, review, { Location: `/v1/reviews/${review.id}`, ETag: etag(review) });
        }
        const review = reviews.get(matchReview[1]);
        if (!review) fail(404, 'REVIEW_NOT_FOUND', 'No in-memory review matches this id.');
        if (matchReview[2] === 'events') return send(res, 200, { review_id: review.id, items: events.get(review.id), synthetic: true });
        if (!matchReview[2]) return send(res, 200, review, { ETag: etag(review) });
        const condition = req.headers['if-match'];
        if (!condition) fail(428, 'IF_MATCH_REQUIRED', 'GET the review, then send its ETag in If-Match.');
        if (condition.trim() !== '*' && !condition.split(',').map(tag => tag.trim()).includes(etag(review))) fail(412, 'REVIEW_VERSION_CHANGED', 'GET the review again before deciding whether to retry.');
        if (review.status !== 'open') fail(409, 'REVIEW_ALREADY_COMPLETE', 'The documentation status is already recorded.');
        const value = await body(req);
        fields(value, ['outcome']);
        if (value.outcome !== 'documentation_complete') fail(400, 'INVALID_OUTCOME', 'Only documentation_complete is supported; this does not approve medication.');
        // Body streaming yields control: recheck before committing a concurrent update.
        if (condition.trim() !== '*' && !condition.split(',').map(tag => tag.trim()).includes(etag(review))) fail(412, 'REVIEW_VERSION_CHANGED', 'GET the review again before deciding whether to retry.');
        if (review.status !== 'open') fail(409, 'REVIEW_ALREADY_COMPLETE', 'The documentation status is already recorded.');
        review.status = 'documented';
        review.version++;
        review.outcome = value.outcome;
        audit(review, 'review.documented');
        return send(res, 200, review, { ETag: etag(review) });
      }
      if (req.method !== 'GET') return send(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET for documentation pages.' } }, { Allow: 'GET' });
      try {
        const target = resolve(siteRoot, `.${decodeURIComponent(path === '/' ? '/index.html' : path)}`);
        if (!target.startsWith(resolve(siteRoot) + sep)) fail(404, 'NOT_FOUND', 'Page not found.');
        const bytes = await readFile(target);
        res.writeHead(200, { 'Content-Type': types[extname(target)] ?? 'application/octet-stream' });
        res.end(bytes);
      } catch { fail(404, 'NOT_FOUND', 'Page not found. Build the documentation first.'); }
    } catch (err) {
      if (res.headersSent) { res.destroy(); return; }
      send(res, err instanceof Failure ? err.status : 500, { error: { code: err instanceof Failure ? err.code : 'INTERNAL_ERROR', message: err instanceof Failure ? err.message : 'Unexpected demo failure.' } });
    }
  });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4020);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535.');
  const server = createServer();
  server.on('error', err => { console.error(err.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`MediList Lab: http://127.0.0.1:${port}/ — synthetic documentation workflow; Ctrl+C to stop.`));
}
