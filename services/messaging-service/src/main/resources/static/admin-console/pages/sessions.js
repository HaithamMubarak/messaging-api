(function(){
  const base = '/messaging-platform/api/v1/messaging-service/admin';
  function h(url, opts){ opts = opts||{}; opts.headers = Object.assign(opts.headers||{}, getAuthHeaders()); return fetch(url, opts).then(r=>r.json()); }
  function getAuthHeaders(){ const k = localStorage.getItem('adminConsoleKey') || ''; const h={}; if(k){ h['X-Api-Key']=k } return h }

  // Safe DOM lookups in case the script is executed in a different context
  const getBtn = document.getElementById('getSession');
  const chInput = document.getElementById('sessionChannel');
  const sidInput = document.getElementById('sessionId');
  const outEl = document.getElementById('sessionResult');

  if (!getBtn || !chInput || !sidInput || !outEl) {
    // Nothing to do if required elements are missing (prevents runtime errors)
    console.warn('sessions.js: required DOM elements not found');
    return;
  }

  function setOutputText(txt) { outEl.textContent = txt; }
  function setOutputHtml(html) { outEl.innerHTML = html; }

  async function fetchSession() {
    const ch = chInput.value.trim();
    const sid = sidInput.value.trim();
    if (!ch || !sid) { alert('Provide channel and session'); return; }

    setOutputText('Loading...');
    try {
      const resp = await h(base + '/channels/' + encodeURIComponent(ch) + '/agents/' + encodeURIComponent(sid));
      if (!resp) {
        setOutputText('Empty response from server');
        return;
      }
      if (resp.status === 'success') {
        // Pretty-print JSON
        setOutputHtml('<pre>' + JSON.stringify(resp.data, null, 2) + '</pre>');
      } else if (resp.status === 'unauthorized') {
        setOutputText('Unauthorized: check admin key or API key.');
      } else {
        setOutputText('Error: ' + (resp.statusMessage || JSON.stringify(resp)));
      }
    } catch (err) {
      console.error('sessions.js fetch error', err);
      setOutputText('Network or server error: ' + (err && err.message ? err.message : String(err)));
    }
  }

  getBtn.addEventListener('click', fetchSession);
  // Allow Enter key in either input to trigger fetch
  [chInput, sidInput].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); fetchSession(); }}));
})();
