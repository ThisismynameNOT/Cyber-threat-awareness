(() => {
  const byId = id => document.getElementById(id);
  const form = byId('access-form');
  const input = byId('owner-key');
  const status = byId('status');
  const results = byId('results');
  const refresh = byId('refresh');
  const lock = byId('lock');
  let ownerKey = '';
  let generation = 0;
  const date = value => value ? new Date(value).toLocaleString() : '—';
  const clear = () => {
    results.hidden = true;
    for (const id of ['campaign-rows', 'test-rows', 'recent-rows']) byId(id).replaceChildren();
    byId('updated').textContent = '';
  };
  const cell = (text, heading = false) => {
    const node = document.createElement(heading ? 'th' : 'td');
    node.textContent = String(text);
    if (heading) node.scope = 'row';
    return node;
  };
  const row = (parent, values) => {
    const node = document.createElement('tr');
    values.forEach((value, index) => node.append(cell(value, index === 0)));
    byId(parent).append(node);
  };
  async function load() {
    const current = ++generation;
    refresh.disabled = true;
    status.textContent = 'Loading results…';
    try {
      const response = await fetch(new URL('../tracking-config.json', location.href), {cache: 'no-store', signal: AbortSignal.timeout(10000)});
      if (!response.ok) throw new Error('Could not load settings. Try again.');
      const config = await response.json();
      if (!config.enabled || !config.endpoint) throw new Error('Tracking is currently disabled.');
      const endpoint = new URL('results', config.endpoint);
      if (endpoint.protocol !== 'https:') throw new Error('Tracking settings are unavailable.');
      const dataResponse = await fetch(endpoint, {
        headers: {Authorization: 'Bearer ' + ownerKey}, cache: 'no-store',
        credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(10000)
      });
      if (current !== generation) return;
      if (dataResponse.status === 401) {
        ownerKey = ''; clear(); form.hidden = false; input.focus();
        throw new Error('That owner key was not accepted. Enter the key from your private access file.');
      }
      if (!dataResponse.ok) throw new Error('The tracker is unavailable. Try Refresh in a moment.');
      const data = await dataResponse.json();
      if (current !== generation) return;
      clear();
      for (const link of data.links) row(link.alias === 'teszt' ? 'test-rows' : 'campaign-rows', [link.label, link.visits, link.education, date(link.last_visit)]);
      for (const event of data.recent) row('recent-rows', [event.label, event.event_type === 'visit' ? 'Page visit' : 'Education button', date(event.created_at)]);
      if (!data.recent.length) row('recent-rows', ['No events recorded yet', '—', '—']);
      byId('updated').textContent = 'Updated ' + date(data.generatedAt);
      results.hidden = false; form.hidden = true; status.textContent = 'Results loaded.';
    } catch (error) {
      if (current !== generation) return;
      status.textContent = error.name === 'TimeoutError' ? 'The request timed out. Try again.' : (error.message || 'Could not load results. Try again.');
    } finally {
      if (current === generation) refresh.disabled = false;
    }
  }
  clear();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    ownerKey = input.value.trim(); input.value = '';
    if (!ownerKey) {status.textContent = 'Enter your owner access key.'; return;}
    await load();
  });
  refresh.addEventListener('click', load);
  lock.addEventListener('click', () => {
    generation++; ownerKey = ''; input.value = ''; clear();
    form.hidden = false; refresh.disabled = false;
    status.textContent = 'Locked. Enter your owner key to view results.'; input.focus();
  });
})();
