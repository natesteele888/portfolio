// Lets the app install and open with a weak signal. Pages load fresh when the network answers within 3 seconds.
const CACHE="portfolio-v2";
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
  const saved=()=>caches.match(r).then(m=>m||caches.match("./"));
  const net=fetch(r);
  // Refresh the saved copy now, while the event runs; a waitUntil made later can be refused.
  e.waitUntil(net.then(res=>{if(res.ok){const c=res.clone();return caches.open(CACHE).then(x=>x.put(r,c))}},()=>{}));
  // One weak bar: a fetch can hang without failing. After 3 seconds show the saved copy if there is one.
  e.respondWith(new Promise(resolve=>{let done=false;const give=res=>{if(!done&&res){done=true;resolve(res)}};
    const t=setTimeout(()=>saved().then(give),3000);
    net.then(res=>{clearTimeout(t);give(res)},()=>{clearTimeout(t);saved().then(m=>{give(m);if(!done){done=true;resolve(Response.error())}})});
  }))});
