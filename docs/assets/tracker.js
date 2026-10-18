(() => {
  const base = new URL('../', document.currentScript.src);
  const allowed = ['utazas-01', 'politika-01', 'zongora-01', 'teszt'];
  const campaign = new URL(location.href).searchParams.get('r') || document.body.dataset.campaign;
  if (!allowed.includes(campaign)) return;
  let send;
  let educationRequested = false;
  document.querySelector('a.retrieve')?.addEventListener('click', () => {
    educationRequested = true;
    if (send) send('education');
  }, { once: true });
  fetch(new URL('tracking-config.json', base), { cache: 'no-store' })
    .then(response => response.ok ? response.json() : null)
    .then(config => {
      if (!config || !config.enabled || !config.endpoint) return;
      const endpoint = new URL(config.endpoint);
      if (endpoint.protocol !== 'https:') return;
      const rid = config.links?.[campaign];
      if (!/^[a-f0-9]{32}$/.test(rid || '')) return;
      send = event => fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rid, event, eventId: crypto.randomUUID() }), keepalive: true,
        credentials: 'omit', referrerPolicy: 'no-referrer'
      }).catch(() => {});
      const notice = document.createElement('p');
      notice.textContent = 'A gyakorlat rögzíti a hivatkozás betöltését és az oktatási gomb használatát.';
      notice.style.cssText = 'margin:18px 0 0;color:#cbc7c2;font:14px/1.5 Arial,sans-serif';
      document.querySelector('.page')?.append(notice);
      send('visit');
      if (educationRequested) send('education');
    }).catch(() => {});
})();
