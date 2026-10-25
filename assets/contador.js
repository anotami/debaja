/* Contador de visitas anónimo (abacus.jasoncameron.dev): sin cookies, sin clave. Si falla, no se muestra nada. */
(function(){
 'use strict';
 var el=document.getElementById('visitas'); if(!el||!window.fetch) return;
 var local=/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
 var url='https://abacus.jasoncameron.dev/'+(local?'get':'hit')+'/anotami-debaja/visitas'; // en local solo lee, no suma
 var ctl=window.AbortController?new AbortController():null, t=setTimeout(function(){if(ctl)ctl.abort();},5000);
 fetch(url,{signal:ctl?ctl.signal:undefined,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'})
  .then(function(r){if(!r.ok) throw 0; return r.json();})
  .then(function(d){clearTimeout(t); var n=Number(d&&d.value); if(!isFinite(n)||n<0) return;
   el.textContent=' · Visitas: '+n.toLocaleString('es-PE'); el.classList.remove('hide');})
  .catch(function(){clearTimeout(t); el.classList.add('hide');});
})();
