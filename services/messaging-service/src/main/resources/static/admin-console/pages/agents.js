(function(){
  const base = '/messaging-platform/api/v1/messaging-service/admin';
  function h(url, opts){ opts = opts||{}; opts.headers = Object.assign(opts.headers||{}, getAuthHeaders()); return fetch(url, opts).then(r=>r.json()); }
  function getAuthHeaders(){ const k = localStorage.getItem('adminConsoleKey') || ''; const h={}; if(k){ h['X-Api-Key']=k } return h }

  const out = document.getElementById('agentsList');
  const refreshBtn = document.getElementById('refreshAgents');
  const filterInput = document.getElementById('agentFilter');

  if (!out || !refreshBtn || !filterInput) { console.warn('agents.js: required DOM elements not found'); return; }

  refreshBtn.addEventListener('click', load);
  filterInput.addEventListener('keydown', e=>{ if (e.key === 'Enter') { e.preventDefault(); load(); } });

  function setLoading() { out.innerHTML = '<p class="small">Loading...</p>'; }
  function setError(msg) { out.innerHTML = '<p class="small">Error: ' + String(msg) + '</p>'; }

  function render(channels){ out.innerHTML = '';
    channels.forEach(ch => {
      const div = document.createElement('div');
      div.innerHTML = `<h3>${escapeHtml(ch.channelId)} (${escapeHtml(String(ch.eventCount||0))})</h3>`;
      if (ch.connectedAgents && ch.connectedAgents.length) {
        const ul = document.createElement('ul');
        ch.connectedAgents.forEach(a=>{ const li = document.createElement('li'); li.textContent = (a.agentName||'') + ' (' + (a.sessionId||'') + ')'; ul.appendChild(li); });
        div.appendChild(ul);
      } else {
        const p = document.createElement('p'); p.textContent = 'No agents'; div.appendChild(p);
      }
      out.appendChild(div);
    })
  }

  function load(){ setLoading(); h(base + '/channels').then(r=>{
    if (!r) { setError('Empty response'); return; }
    if (r.status !== 'success') { setError(r.statusMessage || JSON.stringify(r)); return; }
    const q = filterInput.value.trim().toLowerCase();
    let list = r.data || [];
    if (q) list = list.map(c => ({...c, connectedAgents: (c.connectedAgents||[]).filter(a => (a.agentName||'').toLowerCase().includes(q))})).filter(c => (c.connectedAgents||[]).length > 0);
    render(list);
  }).catch(err=>{ console.error('agents.js load error', err); setError(err && err.message ? err.message : String(err)); }); }

  function escapeHtml(s){ return String(s).replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

  load();
})();
