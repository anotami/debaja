(function(){
 'use strict';
 // ---------- Apoyo con Yape / Plin (se activa con window.YAPE_NUMERO en config.js) ----------
 var num=String(window.YAPE_NUMERO||'').replace(/\D/g,''), on=/^9\d{8}$/.test(num);
 document.querySelectorAll('.apoya-link').forEach(function(el){el.classList.toggle('hide',!on);});
 var box=document.getElementById('apoya');
 if(box&&on){
  var nice=num.replace(/(\d{3})(\d{3})(\d{3})/,'$1 $2 $3'), nom=String(window.YAPE_NOMBRE||'').trim();
  document.getElementById('apoya-off').classList.add('hide'); box.classList.remove('hide');
  document.getElementById('yape-num').textContent=nice;
  if(nom) document.getElementById('yape-nombre').textContent=' · a nombre de '+nom;
  var msg=document.getElementById('yape-msg');
  function done(ok){msg.textContent=ok?'✅ Número copiado: '+nice:'Mantén presionado el número para copiarlo.';}
  document.getElementById('yape-copy').addEventListener('click',function(){
   if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(num).then(function(){done(true)},function(){done(fallback())});}
   else done(fallback());});
  function fallback(){try{var ta=document.createElement('textarea');ta.value=num;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';
   document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,99);var ok=document.execCommand('copy');ta.remove();return ok;}catch(e){return false;}}
 }
 // ---------- Aviso de cookies (solo existe en la página si AdSense está activo) ----------
 var bar=document.getElementById('consent-bar');
 if(bar){var K='debaja-cookies-ok',seen=false;try{seen=localStorage.getItem(K)==='1';}catch(e){}
  if(!seen) bar.classList.remove('hide');
  document.getElementById('consent-ok').addEventListener('click',function(){try{localStorage.setItem(K,'1');}catch(e){}bar.classList.add('hide');});}
})();
