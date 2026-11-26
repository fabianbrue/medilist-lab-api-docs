import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { once } from 'node:events';
import { runInNewContext } from 'node:vm';
import { createServer } from '../src/server.mjs';

// Executes this collection's HTTP requests and assertions with a minimal pm adapter.
// It does not replace importing and running the collection in the actual Postman app.
test('all twelve Postman examples run in order against the real local API', async () => {
  const collection = JSON.parse(await readFile(new URL('../postman/medilist.postman_collection.json', import.meta.url)));
  const environment = JSON.parse(await readFile(new URL('../postman/medilist.postman_environment.json', import.meta.url)));
  const variables = new Map([...collection.variable, ...environment.values].map(x => [x.key, x.value]));
  const server = createServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  variables.set('base_url', `http://127.0.0.1:${server.address().port}`);
  const expand = text => text.replace(/\{\{([^}]+)\}\}/g, (_, key) => { assert.ok(variables.has(key), key); return variables.get(key); });
  let assertions = 0;
  try {
    for (const item of collection.item) {
      const headers = Object.fromEntries(item.request.header.map(x => [x.key, expand(x.value)]));
      if (item.request.auth?.type !== 'noauth') headers['X-Demo-Key'] = variables.get('demo_key');
      const response = await fetch(expand(item.request.url.raw), { method: item.request.method, headers, body: item.request.body && expand(item.request.body.raw) });
      const body = await response.json();
      const pm = {
        test(name, fn) { try { fn(); assertions++; } catch (error) { throw new Error(`${item.name}: ${name}: ${error.message}`); } },
        response: { code: response.status, json: () => body, headers: { get: key => response.headers.get(key) }, to: { have: { status: expected => assert.equal(response.status, expected) } } },
        collectionVariables: { set: (key, value) => variables.set(key, value) },
        expect: actual => ({ to: { eql: expected => assert.equal(JSON.stringify(actual), JSON.stringify(expected)), have: { length: expected => assert.equal(actual.length, expected) } } })
      };
      for (const event of item.event ?? []) if (event.listen === 'test') runInNewContext(event.script.exec.join('\n'), { pm }, { timeout: 1000 });
    }
    assert.ok(assertions >= 24);
    assert.equal(variables.get('review_etag'), '"2"');
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
