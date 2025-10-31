(function(){
  const base = '/messaging-platform/api/v1/messaging-service/admin';
  function h(url, opts){ opts = opts||{}; opts.headers = Object.assign(opts.headers||{}, getAuthHeaders()); return fetch(url, opts).then(r=>r.json()); }
  function postJson(url, body){ return fetch(url, {method:'PUT', headers: Object.assign({'Content-Type':'application/json'}, getAuthHeaders()), body: JSON.stringify(body)}).then(r=>r.json()); }
  function postForm(url, body){ return fetch(url, {method:'POST', headers: Object.assign({'Content-Type':'application/json'}, getAuthHeaders()), body: JSON.stringify(body)}).then(r=>r.json()); }
  function del(url){ return fetch(url, {method:'DELETE', headers: getAuthHeaders()}).then(r=>r.json()); }
  function getAuthHeaders(){ const k = localStorage.getItem('adminConsoleKey') || ''; const h={}; if(k){ h['X-Api-Key']=k } return h }

  const table = document.getElementById('channelsTable');
  const tbody = table ? table.querySelector('tbody') : null;
  const refreshBtn = document.getElementById('refresh');
  const filterInput = document.getElementById('filter');
  const detailPane = document.getElementById('channelDetail');
  const pagination = document.getElementById('pagination');

  const aclEditor = document.getElementById('aclEditor');
  const aclPublic = document.getElementById('aclPublic');
  const aclAddName = document.getElementById('aclAddName');
  const aclAddBtn = document.getElementById('aclAddBtn');
  const reservedList = document.getElementById('reservedList');
  const aclSave = document.getElementById('aclSave');
  const aclCancel = document.getElementById('aclCancel');

  const modalRoot = document.getElementById('modalRoot');

  if (!table || !tbody || !refreshBtn || !filterInput || !detailPane || !pagination) { console.warn('channels.js: required DOM elements not found'); return; }

  // Pagination state
  let currentPage = 1;
  const pageSize = 10;
  let channelsCache = [];
  let currentChannelForAcl = null;

  refreshBtn.addEventListener('click', ()=> load(1));
  filterInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); load(1); } });

  function setDetailHtml(html){ detailPane.innerHTML = html; }
  function setTableLoading(){ tbody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>'; }
  function setTableError(msg){ tbody.innerHTML = '<tr><td colspan="3">Error: ' + String(msg) + '</td></tr>'; }

  function render(list){ tbody.innerHTML='';
    list.forEach(ch=>{
      const id = ch.channelId;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(id)}</td><td>${escapeHtml(String(ch.eventCount||0))}</td><td>
        <button class="btn" data-id="${escapeHtml(id)}">View</button>
        <button class="copy-btn" data-copy="${escapeHtml(id)}">Copy</button>
        <button class="btn acl-btn" data-acl="${escapeHtml(id)}">ACL</button>
        <button class="btn" data-delete="${escapeHtml(id)}">Delete</button>
      </td>`;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('button[data-id]').forEach(b=>b.addEventListener('click', e=>{ const id = b.getAttribute('data-id'); loadDetail(id); }));
    tbody.querySelectorAll('button[data-copy]').forEach(b=>b.addEventListener('click', e=>{ const id = b.getAttribute('data-copy'); copyToClipboard(id); }));
    tbody.querySelectorAll('button[data-acl]').forEach(b=>b.addEventListener('click', e=>{ const id = b.getAttribute('data-acl'); openAclEditor(id); }));
    tbody.querySelectorAll('button[data-delete]').forEach(b=>b.addEventListener('click', e=>{ const id = b.getAttribute('data-delete'); openDeleteModal(id); }));

    renderPagination();
  }

  function renderPagination(){ pagination.innerHTML = '';
    const total = channelsCache.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    for (let p=1;p<=pages;p++){
      const btn = document.createElement('button'); btn.className='page-btn' + (p===currentPage? ' active':''); btn.textContent = p; btn.addEventListener('click', ()=>{ currentPage = p; refreshPage(); });
      pagination.appendChild(btn);
    }
  }

  function refreshPage(){ const start = (currentPage-1)*pageSize; const page = channelsCache.slice(start, start+pageSize); render(page); }

  function load(pageToOpen){ setTableLoading(); currentPage = pageToOpen || 1; h(base + '/channels').then(r=>{
    if (!r) { setTableError('Empty response'); return; }
    if (r.status !== 'success') { setTableError(r.statusMessage || JSON.stringify(r)); return; }
    let list = r.data || [];
    const q = filterInput.value.trim().toLowerCase();
    if (q) list = list.filter(c => (c.channelId||'').toLowerCase().includes(q));
    channelsCache = list;
    refreshPage();
  }).catch(err=>{ console.error('channels.js load error', err); setTableError(err && err.message ? err.message : String(err)); }); }

  function loadDetail(id){ if (!id) return; setDetailHtml('<p class="small">Loading channel...</p>'); h(base + '/channel/' + encodeURIComponent(id)).then(r=>{
    if (!r) { setDetailHtml('Empty response'); return; }
    if (r.status !== 'success') { setDetailHtml('Error: ' + (r.statusMessage||JSON.stringify(r))); return; }
    const d = r.data;
    let html = '<h3>Channel ' + escapeHtml(id) + '</h3>';
    html += '<div class="controls"><button id="refreshChannelBtn" class="btn">Refresh</button> <button id="openAclFromDetail" class="btn">Edit ACL</button></div>';
    html += '<pre>' + escapeHtml(JSON.stringify(d, null, 2)) + '</pre>';
    setDetailHtml(html);
    document.getElementById('refreshChannelBtn').addEventListener('click', ()=> loadDetail(id));
    document.getElementById('openAclFromDetail').addEventListener('click', ()=> openAclEditor(id));
  }).catch(err=>{ console.error('channels.js loadDetail error', err); setDetailHtml('Error: ' + (err && err.message ? err.message : String(err))); }); }

  function copyToClipboard(text){ try{ navigator.clipboard.writeText(text); alert('Copied: ' + text); }catch(e){ console.warn('clipboard failed', e); prompt('Copy this', text); } }

  // ACL editor handling
  function openAclEditor(channelId){ currentChannelForAcl = channelId; aclEditor.style.display = 'block'; reservedList.innerHTML = '<div class="small">Loading...</div>'; h(base + '/channel/' + encodeURIComponent(channelId) + '/acl').then(r=>{
    if (!r || r.status !== 'success') { reservedList.innerHTML = '<div class="small">Error loading ACL</div>'; return; }
    const meta = r.data || {};
    aclPublic.checked = !!meta.publicChannel;
    renderReservedList(meta.allowedAgentsNames || meta.allowedAgents || []);
  }).catch(err=>{ console.error('acl load error', err); reservedList.innerHTML = '<div class="small">Error: '+(err && err.message?err.message:String(err))+'</div>'; }); }

  function renderReservedList(list){ reservedList.innerHTML = ''; (list||[]).forEach(name=>{
    const div = document.createElement('div'); div.className='reserved-item';
    const span = document.createElement('span'); span.textContent = name;
    const rem = document.createElement('button'); rem.className='btn'; rem.textContent='Remove'; rem.addEventListener('click', ()=> removeReserved(name));
    div.appendChild(span); div.appendChild(rem); reservedList.appendChild(div);
  }); }

  aclAddBtn.addEventListener('click', ()=>{
    const n = (aclAddName.value||'').trim(); if (!n) return; // add locally; save when user clicks Save
    const cur = Array.from(reservedList.querySelectorAll('span')).map(s=>s.textContent);
    if (cur.includes(n)) { alert('Already present'); return; }
    renderReservedList([...cur, n]); aclAddName.value='';
  });

  function removeReserved(name){ const cur = Array.from(reservedList.querySelectorAll('span')).map(s=>s.textContent); renderReservedList(cur.filter(x=>x!==name)); }

  aclCancel.addEventListener('click', ()=>{ aclEditor.style.display='none'; currentChannelForAcl=null; });

  aclSave.addEventListener('click', ()=>{
    if (!currentChannelForAcl) return; const reserved = Array.from(reservedList.querySelectorAll('span')).map(s=>s.textContent);
    const payload = { publicChannel: aclPublic.checked, allowedAgentsNames: reserved };
    // Use PUT /channel/{id}/acl
    postJson(base + '/channel/' + encodeURIComponent(currentChannelForAcl) + '/acl', payload).then(r=>{
      if (!r) { alert('Empty response'); return; }
      if (r.status !== 'success') { alert('Error: ' + (r.statusMessage||JSON.stringify(r))); return; }
      alert('ACL updated'); aclEditor.style.display='none';
      // refresh detail if open
      const detailChannel = document.querySelector('#channelDetail h3');
      if (detailChannel && detailChannel.textContent && detailChannel.textContent.includes(currentChannelForAcl)) loadDetail(currentChannelForAcl);
    }).catch(err=>{ console.error('acl save error', err); alert('Save failed: ' + (err && err.message?err.message:String(err))); });
  });

  // Secret delete modal
  function openDeleteModal(channelId){ const modal = document.createElement('div'); modal.className='modal-backdrop'; modal.innerHTML = '<div class="modal-content">\n  <h3>Confirm deletion</h3>\n  <p>Delete channel <b>'+escapeHtml(channelId)+'</b> fully: clear cache, delete DB record and try to delete topic. This action is destructive.</p>\n  <div class="actions"><button id="confirmDelete" class="btn">Delete</button><button id="cancelDelete" class="btn">Cancel</button></div>\n</div>';
    modalRoot.appendChild(modal);
    modal.querySelector('#cancelDelete').addEventListener('click', ()=>{ modal.remove(); });
    modal.querySelector('#confirmDelete').addEventListener('click', ()=>{ modal.querySelector('#confirmDelete').disabled=true; h(base + '/secret/channel/' + encodeURIComponent(channelId) + '/delete-full', {method:'POST', headers:getAuthHeaders()}).then(r=>{ if (!r) alert('Empty response'); else if (r.status !== 'success') alert('Error: '+(r.statusMessage||JSON.stringify(r))); else { alert('Deleted: '+JSON.stringify(r.data)); load(1); } modal.remove(); }).catch(err=>{ alert('Delete failed: '+(err && err.message?err.message:String(err))); modal.remove(); }); });
  }

  function escapeHtml(s){ return String(s).replace(/[&<>'\"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[c])); }

  // initial load
  load(1);
})();
