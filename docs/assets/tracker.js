(() => {
  const base = new URL('../', document.currentScript.src);
  const allowed = ['utazas-01', 'politika-01', 'zongora-01', 'teszt'];
  const campaign = new URL(location.href).searchParams.get('r') || document.body.dataset.campaign;
  if (!allowed.includes(campaign)) return;
  fetch(new URL('tracking-config.json', base), { cache: 'no-store' })
    .then(response => response.ok ? response.json() : null)
    .then(config => {
      if (!config || !config.enabled || !config.endpoint) return;
      const endpoint = new URL(config.endpoint);
      if (endpoint.protocol !== 'https:') return;
      const send = event => fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign, event }), keepalive: true,
        credentials: 'omit', referrerPolicy: 'no-referrer'
      }).catch(() => {});
      const notice = document.createElement('p');
      notice.textContent = 'A gyakorlat rögzíti a hivatkozás betöltését és az oktatási gomb használatát.';
      notice.style.cssText = 'margin:18px 0 0;color:#cbc7c2;font:14px/1.5 Arial,sans-serif';
      document.querySelector('.page')?.append(notice);
      send('visit');
      document.querySelector('a.retrieve')?.addEventListener('click', () => send('education'), { once: true });
    }).catch(() => {});
})();
