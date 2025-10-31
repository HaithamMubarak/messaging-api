(function(){
  const base = '/messaging-platform/api/v1/messaging-service/admin';
  function h(url, opts){ opts = opts||{}; opts.headers = Object.assign(opts.headers||{}, getAuthHeaders()); return fetch(url, opts).then(r=>r.json()); }
  function getAuthHeaders(){ const k = localStorage.getItem('adminConsoleKey') || ''; const h={}; if(k){ h['X-Api-Key']=k } return h }

  const refreshBtn = document.getElementById('refreshAudit');
  const limitInput = document.getElementById('auditLimit');
  const out = document.getElementById('auditList');

  if (!refreshBtn || !limitInput || !out) { console.warn('audit.js: required DOM elements not found'); return; }

  refreshBtn.addEventListener('click', load);
  limitInput.addEventListener('keydown', e=>{ if (e.key === 'Enter') { e.preventDefault(); load(); } });

  function setOutHtml(html){ out.innerHTML = html; }
  function setOutText(txt){ out.textContent = txt; }

  function load(){ const lim = (limitInput.value || '').trim() || '50'; setOutText('Loading...'); h(base + '/audit?limit=' + encodeURIComponent(lim)).then(r=>{
    if (!r) { setOutText('Empty response'); return; }
    if (r.status !== 'success') { setOutText('Error: '+(r.statusMessage||JSON.stringify(r))); return; }
    setOutHtml('<pre>' + escapeHtml(JSON.stringify(r.data, null, 2)) + '</pre>');
  }).catch(err=>{ console.error('audit.js load error', err); setOutText('Error: ' + (err && err.message ? err.message : String(err))); }); }

  function escapeHtml(s){ return String(s).replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
})();
