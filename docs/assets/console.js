const form = document.querySelector('[data-demo-console]');
if (form) {
  const status = form.querySelector('[data-console-status]');
  const output = form.querySelector('[data-console-output]');
  const local = location.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(location.hostname);
  let reviewId;
  let reviewEtag;
  if (!local) {
    for (const control of form.querySelectorAll('button,select')) control.disabled = true;
    status.textContent = 'Static documentation preview. Run the local demo to send synthetic requests.';
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!local) return;
    const request = form.elements.request.value;
    const headers = { 'X-Demo-Key': 'medilist-demo', 'X-Demo-Role': form.elements.role.value };
    let path = '/v1/cases/case-demo-001/' + (request === 'lists' ? 'medication-lists' : 'comparison');
    let method = 'GET';
    let body;
    if (request === 'create') {
      path = '/v1/reviews'; method = 'POST';
      body = { case_id: 'case-demo-001', source_versions: { 'hospital-demo': 1, 'record-demo': 1 } };
    } else if (['read', 'complete', 'events', 'stale'].includes(request)) {
      if (!reviewId) { status.textContent = 'First create a review using the reviewer role.'; return; }
      path = '/v1/reviews/' + encodeURIComponent(reviewId);
      if (request === 'events') path += '/events';
      if (['complete', 'stale'].includes(request)) {
        path += '/complete'; method = 'POST';
        headers['If-Match'] = request === 'stale' ? '"0"' : reviewEtag;
        body = { outcome: 'documentation_complete' };
      }
    }
    if (body) headers['Content-Type'] = 'application/json';
    form.querySelector('button').disabled = true;
    try {
      const response = await fetch(path, { method, headers, body: body && JSON.stringify(body) });
      const result = await response.json();
      if (response.ok && result.id) { reviewId = result.id; reviewEtag = response.headers.get('etag'); }
      status.textContent = `${method} ${path} → HTTP ${response.status}`;
      output.textContent = JSON.stringify({ etag: response.headers.get('etag'), body: result }, null, 2);
    } catch (error) { status.textContent = 'Local request failed: ' + error.message; }
    finally { form.querySelector('button').disabled = false; }
  });
}
