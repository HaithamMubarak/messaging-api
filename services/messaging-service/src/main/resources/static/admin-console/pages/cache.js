(function(){
  const base = '/messaging-platform/api/v1/messaging-service/admin';
  function h(url, opts){ opts = opts||{}; opts.headers = Object.assign(opts.headers||{}, getAuthHeaders()); return fetch(url, opts).then(r=>r.json()); }
  function getAuthHeaders(){ const k = localStorage.getItem('adminConsoleKey') || ''; const h={}; if(k){ h['X-Api-Key']=k } return h }

  const peekBtn = document.getElementById('peekOffsets');
  const chInput = document.getElementById('cacheChannel');
  const out = document.getElementById('cacheResult');

  if (!peekBtn || !chInput || !out) { console.warn('cache.js: required DOM elements not found'); return; }

  peekBtn.addEventListener('click', load);
  chInput.addEventListener('keydown', e=>{ if (e.key === 'Enter') { e.preventDefault(); load(); } });

  function setOutHtml(html){ out.innerHTML = html; }
  function setOutText(text){ out.textContent = text; }

  function load(){ const ch = chInput.value.trim(); if (!ch) { alert('Provide channel'); return; }
    setOutText('Loading...');
    h(base + '/channel/' + encodeURIComponent(ch) + '/offsets').then(r=>{
      if (!r) { setOutText('Empty response'); return; }
      if (r.status !== 'success') { setOutText('Error: ' + (r.statusMessage||JSON.stringify(r))); return; }
      setOutHtml('<pre>' + escapeHtml(JSON.stringify(r.data, null, 2)) + '</pre>');
    }).catch(err=>{ console.error('cache.js load error', err); setOutText('Error: ' + (err && err.message ? err.message : String(err))); });
  }

  function escapeHtml(s){ return String(s).replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
})();
