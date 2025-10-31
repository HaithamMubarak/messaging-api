(function(){
  const base = '/messaging-platform/api/v1/messaging-service/admin';
  function getAuthHeaders() {
    const key = localStorage.getItem('adminConsoleKey') || '';
    const headers = {};
    if (key) {
      // allow user to paste either raw Authorization value or user:pass; otherwise treat as API key
      if (key.startsWith('Basic ') || key.startsWith('basic ')) {
        headers['Authorization'] = key;
      } else if (key.includes(':')) {
        // treat as Basic user:pass
        headers['Authorization'] = 'Basic ' + btoa(key);
      } else {
        // use developer/admin API key header
        headers['X-Api-Key'] = key;
      }
    }
    return headers;
  }

  document.getElementById('saveKey').addEventListener('click', ()=>{
    const v = document.getElementById('adminKey').value.trim();
    localStorage.setItem('adminConsoleKey', v);
    alert('Saved key');
  });

  // Simple client-side router: load pages from ./pages
  function loadPage(path) {
    const main = document.getElementById('main');
    fetch('./pages/' + path)
      .then(r => r.text())
      .then(html => {
        main.innerHTML = html;
        // load page script if present
        const scriptUrl = './pages/' + path.replace('.html', '.js');
        fetch(scriptUrl).then(r=>{ if (r.ok) { return r.text(); } throw 'no script' }).then(js=>{ try{ eval(js) }catch(e){console.error(e)} }).catch(()=>{});
      });
  }

  // Wire nav links
  document.querySelectorAll('nav a').forEach(a=>{
    a.addEventListener('click', e=>{ e.preventDefault(); const href = a.getAttribute('href'); const parts = href.split('/'); const page = parts[parts.length-1]; loadPage(page); });
  });

  // If hash present, open corresponding page
  const hash = window.location.hash.replace('#','');
  if (hash) {
    const link = Array.from(document.querySelectorAll('nav a')).find(a=>a.href.includes(hash));
    if (link) link.click();
  }
})();
