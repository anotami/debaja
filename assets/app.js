(function(){
 'use strict';
 var NUM=String(window.WHATSAPP_NUMBER||'').replace(/\D/g,''), NUM_OK=/^\d{10,15}$/.test(NUM);
 document.querySelectorAll('.wa-contact').forEach(function(el){
  if(NUM_OK){var a=document.createElement('a');a.href='https://wa.me/'+NUM;a.target='_blank';a.rel='noopener';a.textContent='WhatsApp +'+NUM;el.textContent='';el.appendChild(a);}
  else el.textContent=el.textContent||'WhatsApp';});
 var ROOT=document.body.dataset.root||'./';
 // ---------- Catálogo: búsqueda + filtros ----------
 var q=document.getElementById('q');
 if(q){var ind='',mod='';
  var norm=function(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');};
  function apply(){var t=norm(q.value.trim()),n=0;
   document.querySelectorAll('.card[data-ind]').forEach(function(c){
    var ok=(!ind||c.dataset.ind===ind)&&(!mod||c.dataset.mod===mod)&&(!t||norm(c.dataset.q).indexOf(t)>=0);c.classList.toggle('hide',!ok);if(ok)n++;});
   document.querySelectorAll('.ind-block').forEach(function(b){b.classList.toggle('hide',!b.querySelector('.card:not(.hide)'));});
   document.getElementById('nres').textContent=n+' servicio'+(n===1?'':'s');}
  function chips(id,key,set){document.querySelectorAll('#'+id+' .chip').forEach(function(b){b.addEventListener('click',function(){
   document.querySelectorAll('#'+id+' .chip').forEach(function(x){x.classList.remove('on')});b.classList.add('on');set(b.dataset[key]);apply();});});}
  chips('ind','ind',function(v){ind=v});chips('mod','mod',function(v){mod=v});q.addEventListener('input',apply);apply();}

 // ---------- Formulario → WhatsApp ----------
 var form=document.getElementById('f'); if(!form) return;
 var D=JSON.parse(document.getElementById('svc-data').textContent), sel=document.getElementById('servicio');
 var qs=new URLSearchParams(location.search).get('servicio'); if(qs&&(qs==='otro'||D.services[qs]))sel.value=qs;
 function limaToday(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());} // YYYY-MM-DD
 function addDays(iso,n){var d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
 var today=limaToday(), fb=document.getElementById('fecha_baja'); fb.min=today; fb.max=addDays(today,120); if(!fb.value)fb.value=today;
 function titular(){return (form.querySelector('input[name=titular]:checked')||{}).value||'';}
 function docsNeeded(){var s=D.services[sel.value],l=[];
  (s?s.adjuntos:(sel.value==='otro'?['dni']:[])).forEach(function(k){l.push(D.docs[k]);});
  if(titular()==='no')l.push(D.docs.carta_poder);
  if(sel.value==='otro')l.push(D.docs.recibo+' (opcional, ayuda a ubicar el servicio)');
  return l;}
 function fillList(ul,l){ul.innerHTML='';(l.length?l:['No se requieren documentos para este servicio (si nos falta algo, te lo pediremos en el chat).']).forEach(function(t){var li=document.createElement('li');li.textContent=t;ul.appendChild(li);});}
 function upd(){var s=D.services[sel.value],otro=sel.value==='otro';
  document.getElementById('otro-w').classList.toggle('hide',!otro);
  document.getElementById('idl').textContent=s?s.id_label:'Número de línea, contrato, suministro o correo de la cuenta';
  document.getElementById('poder-note').classList.toggle('hide',titular()!=='no');
  var lk=document.getElementById('svc-link');lk.innerHTML='';
  if(s){var a=document.createElement('a');a.href=ROOT+'servicio/'+sel.value+'/';a.textContent='Ver requisitos de '+s.nombre;lk.appendChild(a);}
  fillList(document.getElementById('docs-list'),docsNeeded());}
 sel.addEventListener('change',upd);form.querySelectorAll('input[name=titular]').forEach(function(r){r.addEventListener('change',upd)});upd();
 var dt=document.getElementById('doc_tipo'),dn=document.getElementById('doc_num');
 function ph(){dn.placeholder=dt.value==='DNI'?'8 dígitos':'9 a 12 caracteres';dn.inputMode=dt.value==='DNI'?'numeric':'text';}dt.addEventListener('change',ph);ph();

 function looksLikeCard(t){var m,re=/(?:\d[ -]?){13,19}/g;while((m=re.exec(t||''))){var d=m[0].replace(/\D/g,''),tot=0;
   for(var i=0;i<d.length;i++){var n=+d[d.length-1-i]*(i%2?2:1);tot+=n>9?n-9:n;} if(d.length>=13&&d.length<=19&&tot%10===0)return true;} return false;}
 function validate(){var f=form.elements,e={},v={};
  v.servicio=sel.value; var s=D.services[v.servicio];
  if(!v.servicio)e.servicio='Elige el servicio que quieres dar de baja.';
  v.otro=f.otro_nombre.value.trim().slice(0,100);
  if(v.servicio==='otro'&&v.otro.length<2)e.otro_nombre='Escribe qué servicio quieres dar de baja.';
  v.service_name=s?s.nombre:(v.servicio==='otro'?'Otro: '+v.otro:'');
  v.nombre=f.nombre.value.split(/\s+/).filter(Boolean).join(' ');
  if(!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]{5,120}$/.test(v.nombre)||v.nombre.indexOf(' ')<0)e.nombre='Escribe tu nombre completo (nombres y apellidos).';
  v.doc_tipo=f.doc_tipo.value; v.doc_num=f.doc_num.value.trim().toUpperCase();
  if(v.doc_tipo==='DNI'){if(!/^\d{8}$/.test(v.doc_num))e.doc_num='El DNI debe tener 8 dígitos.';}
  else if(!/^[A-Z0-9]{9,12}$/.test(v.doc_num))e.doc_num='El carné de extranjería debe tener entre 9 y 12 caracteres (letras y números).';
  var cel=f.celular.value.replace(/[\s-]/g,''); if(cel.indexOf('+51')===0)cel=cel.slice(3); v.celular=cel;
  if(!/^9\d{8}$/.test(cel))e.celular='El celular debe tener 9 dígitos y empezar con 9.';
  v.titular=titular(); if(v.titular!=='si'&&v.titular!=='no')e.titular='Indica si eres el titular del servicio.';
  v.identificador=f.identificador.value.trim().slice(0,120);
  if(!v.identificador)e.identificador='Este dato es necesario para ubicar tu servicio.';
  else if(looksLikeCard(v.identificador))e.identificador='No ingreses números de tarjeta. Nunca los pedimos.';
  v.motivo=f.motivo.value.trim().slice(0,500); if(looksLikeCard(v.motivo))e.motivo='No incluyas números de tarjeta ni cuentas.';
  v.fecha_baja=f.fecha_baja.value;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(v.fecha_baja)||v.fecha_baja<today||v.fecha_baja>addDays(today,120))e.fecha_baja='Elige una fecha entre hoy y los próximos 4 meses.';
  if(!f.consent.checked)e.consent='Necesitamos tu consentimiento para gestionar la baja.';
  v.id_label=s?s.id_label:'Línea/contrato/suministro/cuenta';
  return {v:v,e:e};}
 function newCode(){var A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',r=new Uint32Array(4),c='';crypto.getRandomValues(r);
  for(var i=0;i<4;i++)c+=A[r[i]%A.length]; return 'DB-'+today.replace(/-/g,'')+'-'+c;}
 function fmtDate(iso){var p=iso.split('-');return p[2]+'/'+p[1]+'/'+p[0];}
 function buildMessage(v,code,docs){var L=[
   'Hola, quiero solicitar una baja con DeBaja.pe.','',
   '*Código:* '+code,
   '*Servicio:* '+v.service_name+(D.services[v.servicio]?' ('+D.services[v.servicio].industria+')':''),
   '*Nombre:* '+v.nombre,
   '*Documento:* '+v.doc_tipo+' '+v.doc_num,
   '*Celular:* '+v.celular,
   '*'+v.id_label+':* '+v.identificador,
   '*¿Soy el titular?:* '+(v.titular==='si'?'Sí':'No (enviaré carta poder)'),
   '*Fecha deseada de baja:* '+fmtDate(v.fecha_baja)];
  if(v.motivo)L.push('*Motivo:* '+v.motivo);
  L.push('','*Adjuntaré en este chat:*');docs.forEach(function(d){L.push('- '+d);});
  L.push('','Autorizo el tratamiento de mis datos personales para gestionar esta baja (Ley N.° 29733).');
  return L.join('\n');}
 form.addEventListener('submit',function(ev){ev.preventDefault();
  var r=validate(),first=null;
  form.querySelectorAll('[data-err]').forEach(function(p){var m=r.e[p.dataset.err]||'';p.textContent=m;if(m&&!first)first=p;});
  document.getElementById('errsum').classList.toggle('hide',!first);
  if(first){(first.previousElementSibling||first).scrollIntoView({block:'center'});return;}
  var code=newCode(),docs=docsNeeded(),msg=buildMessage(r.v,code,docs);
  var url='https://wa.me/'+(NUM_OK?NUM:'')+'?text='+encodeURIComponent(msg);
  document.getElementById('done-code').textContent=code;
  fillList(document.getElementById('done-docs'),docs);
  var a=document.getElementById('wa-link');a.href=url;
  document.getElementById('cfg-warn').classList.toggle('hide',NUM_OK);
  document.getElementById('form-wrap').classList.add('hide');document.getElementById('done').classList.remove('hide');window.scrollTo(0,0);
  if(NUM_OK)window.open(url,'_blank','noopener');});
 document.getElementById('edit').addEventListener('click',function(e){e.preventDefault();
  document.getElementById('done').classList.add('hide');document.getElementById('form-wrap').classList.remove('hide');});
})();
