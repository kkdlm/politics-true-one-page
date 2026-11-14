const CACHE='app-1.2.7';
const ASSETS=['./','index.html','apple-touch-icon.png','icon-192.png','icon-512.png','manifest.webmanifest'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET') return;
  if(r.mode==='navigate'){
    e.respondWith((async()=>{
      const c=await caches.open(CACHE);
      const hit=await c.match('index.html');
      const net=fetch(r).then(res=>{ if(res&&res.ok) c.put('index.html',res.clone()); return res; }).catch(()=>null);
      return hit || (await net) || new Response('offline',{status:503});
    })());
    return;
  }
  e.respondWith(caches.match(r).then(c=>c||fetch(r)));
});
