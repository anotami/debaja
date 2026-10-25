(function(){
 'use strict';
 var data=document.getElementById('rv-data'); if(!data) return;
 var SV=JSON.parse(data.textContent), ROOT=document.body.dataset.root||'./', KEY='debaja-revisa-v1';
 var NUM=String(window.WHATSAPP_NUMBER||'').replace(/\D/g,''), NUM_OK=/^\d{10,15}$/.test(NUM);
 var norm=function(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();};
 var BY={}; SV.forEach(function(s){BY[norm(s.n)]=s;});
 var TELCO_RE=/(internet|fibra|cable|\btv\b|television|movil|celular|linea|telefon|postpago|prepago|movistar|claro|entel|bitel|\bwow\b|\bwin\b|directv)/;
 var rows=document.getElementById('rows'), tpl=document.getElementById('row-tpl');
 var LBL={rojo:'Revisar',amarillo:'Negociar',verde:'Mantener'};
 var USO={semana:'Esta semana',mes:'Este mes','1a3':'Hace 1 a 3 meses',mas3:'Hace más de 3 meses',nose:'No me acuerdo'};
 function money(n){return 'S/ '+(Math.round(n*100)/100).toFixed(2);}
 function find(name){var k=norm(name); if(BY[k]) return BY[k];
  for(var i=0;i<SV.length;i++){var n=norm(SV[i].n); if(k.length>=4&&(n.indexOf(k)===0||k===n.split(' ')[0])) return SV[i];} return null;}
 function evalRow(v){var s=find(v.svc), why=[];
  if(v.uso==='1a3'||v.uso==='mas3') why.push('no lo usas hace más de 1 mes');
  if(v.uso==='nose') why.push('no recuerdas cuándo lo usaste');
  if(v.dup==='si') why.push('tienes otro parecido');
  if(v.sube==='si') why.push('el precio subió');
  var telco=s?s.telco:TELCO_RE.test(norm(v.svc));
  var st=why.length?'rojo':(telco?'amarillo':'verde');
  if(st==='amarillo') why.push('telefonía, internet o TV: puedes pedir descuento o retención');
  if(st==='verde') why.push('lo usas y no vemos nada que cambiar');
  return {s:s,st:st,why:why};}
 function read(r){return {svc:r.querySelector('.f-svc').value.trim(),monto:parseFloat(r.querySelector('.f-monto').value)||0,
  uso:r.querySelector('.f-uso').value,dup:r.querySelector('.f-dup').value,sube:r.querySelector('.f-sube').value};}
 function all(){return Array.prototype.map.call(rows.querySelectorAll('.rv-row'),function(r){return {el:r,v:read(r)};});}
 function addRow(v){var r=tpl.content.firstElementChild.cloneNode(true); v=v||{};
  r.querySelector('.f-svc').value=v.svc||''; r.querySelector('.f-monto').value=v.monto||'';
  r.querySelector('.f-uso').value=v.uso||'semana'; r.querySelector('.f-dup').value=v.dup||'no'; r.querySelector('.f-sube').value=v.sube||'no';
  r.addEventListener('input',update); r.addEventListener('change',update);
  r.querySelector('.rv-del').addEventListener('click',function(){r.remove();update();});
  rows.appendChild(r); return r;}
 function update(){var L=all(), tot=0, ahorro=0, nR=0, nA=0, filled=0;
  L.forEach(function(x){var v=x.v, r=x.el, e=evalRow(v), b=r.querySelector('.rv-badge'), w=r.querySelector('.rv-why');
   var has=v.svc||v.monto; r.dataset.st=has?e.st:''; x.e=e;
   b.className='cb rv-badge'+(has?' cb-'+e.st:''); b.textContent=has?LBL[e.st]:'Completa el servicio';
   w.textContent=''; if(has){w.appendChild(document.createTextNode('Por qué: '+e.why.join(', ')+'. '));
    if(e.s){var a=document.createElement('a');a.href=ROOT+'servicio/'+e.s.id+'/#ficha';a.textContent='Ver ficha de '+e.s.n;w.appendChild(a);
     if(e.st==='amarillo'&&e.s.desc){w.appendChild(document.createTextNode(' · '));var a2=document.createElement('a');a2.href=ROOT+'servicio/'+e.s.desc+'/';a2.textContent='Cómo pedir descuento';w.appendChild(a2);}}}
   if(has){filled++; tot+=v.monto; if(e.st==='rojo'){nR++;ahorro+=v.monto;} if(e.st==='amarillo')nA++;}});
  document.getElementById('t-mes').textContent=money(tot);
  document.getElementById('t-anio').textContent=money(tot*12);
  document.getElementById('t-ahorro').textContent=money(ahorro)+' al mes';
  document.getElementById('t-ahorro-a').textContent=money(ahorro*12)+' al año';
  var m=document.getElementById('msg'); m.className='rv-msg';
  if(!filled){m.textContent='Agrega tus cobros para ver el resultado.';}
  else if(!nR){m.classList.add('good');m.textContent='✅ No encontramos nada para cortar. ¡Bien! Tus cobros se ven en orden.'+(nA?' Igual podrías pedir descuento en '+nA+' servicio'+(nA>1?'s':'')+' de telefonía, internet o TV.':'');}
  else{m.classList.add('bad');m.textContent='Te sugerimos revisar '+nR+' cobro'+(nR>1?'s':'')+': podrías ahorrar hasta '+money(ahorro)+' al mes ('+money(ahorro*12)+' al año).'+(nA?' Además, podrías negociar '+nA+'.':'');}
  save(); waLink(L);}
 function list(){return all().map(function(x){return x.v;}).filter(function(v){return v.svc||v.monto;});}
 function save(){var rem=document.getElementById('remember');
  try{if(rem.checked) localStorage.setItem(KEY,JSON.stringify(list())); else localStorage.removeItem(KEY);}catch(e){}}
 function rowsOut(){return all().filter(function(x){return x.v.svc||x.v.monto;}).map(function(x){var e=evalRow(x.v);return [x.v.svc||'(sin nombre)',x.v.monto.toFixed(2),USO[x.v.uso],x.v.dup==='si'?'Sí':'No',x.v.sube==='si'?'Sí':'No',LBL[e.st],e.why.join('; ')];});}
 function download(name,text,type){var b=new Blob([text],{type:type}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},1000);}
 document.getElementById('dl').addEventListener('click',function(){
  var q=function(c){c=String(c);return /[",;\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c;};
  var csv=[['Servicio','Monto mensual (S/)','Última vez que lo usó','Duplicado','Subió el precio','Resultado','Motivo']].concat(rowsOut()).map(function(r){return r.map(q).join(',');}).join('\r\n');
  download('mis-suscripciones.csv','\ufeff'+csv,'text/csv;charset=utf-8');});
 document.getElementById('dltxt').addEventListener('click',function(){
  var t='Mis suscripciones (DeBaja.pe)\n\n'+rowsOut().map(function(r){return '- '+r[0]+': S/ '+r[1]+' al mes · '+r[5]+' ('+r[6]+')';}).join('\n')+'\n\n'+
   'Total al mes: '+document.getElementById('t-mes').textContent+'\nTotal al año: '+document.getElementById('t-anio').textContent+'\nAhorro posible: '+document.getElementById('t-ahorro').textContent+'\n';
  download('mis-suscripciones.txt',t,'text/plain;charset=utf-8');});
 document.getElementById('clear').addEventListener('click',function(){
  if(!confirm('¿Borrar tu lista de este dispositivo?')) return;
  try{localStorage.removeItem(KEY);}catch(e){} rows.innerHTML=''; document.getElementById('remember').checked=false; addRow(); update();});
 document.getElementById('remember').addEventListener('change',save);
 document.getElementById('add').addEventListener('click',function(){var r=addRow();update();r.querySelector('.f-svc').focus();});
 document.getElementById('demo').addEventListener('click',function(){rows.innerHTML='';
  [{svc:'Netflix',monto:35,uso:'semana'},{svc:'Disney+',monto:30,uso:'mas3',dup:'si'},{svc:'Movistar',monto:89.9,uso:'semana'},{svc:'Smart Fit',monto:99,uso:'1a3'},{svc:'Spotify',monto:20,uso:'semana'}].forEach(addRow);update();});
 var waOk=document.getElementById('wa-ok'), wa=document.getElementById('wa');
 function waLink(L){var show=waOk.checked&&NUM_OK; wa.classList.toggle('hide',!show); if(!show) return;
  var t='Hola, hice la revisión de mis suscripciones en DeBaja.pe y quiero ayuda:\n'+rowsOut().map(function(r){return '- '+r[0]+' (S/ '+r[1]+'/mes): '+r[5];}).join('\n');
  wa.href='https://wa.me/'+NUM+'?text='+encodeURIComponent(t);}
 waOk.addEventListener('change',function(){waLink();});
 var saved=null; try{saved=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){}
 if(saved&&saved.length){document.getElementById('remember').checked=true; saved.forEach(addRow);} else addRow();
 update();
})();
