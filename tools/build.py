#!/usr/bin/env python3
"""Genera el sitio estático de DeBaja.pe a partir de data/services.json y data/rights.json.
Uso:  pip install jinja2  &&  python tools/build.py
Escribe index.html, servicio/<id>/index.html, solicitar/[<id>/]index.html y privacidad/index.html.
Todas las rutas son relativas, así funciona en https://<usuario>.github.io/<repo>/ o en un dominio propio."""
import json, os, re, shutil, datetime
from jinja2 import Environment, FileSystemLoader, select_autoescape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = "DeBaja.pe"
TAGLINE = "Damos de baja tus servicios y suscripciones, sin colas ni vueltas."
RESPONSABLE = "DeBaja.pe"  # titular del banco de datos (Ley 29733)
DOCS = {"dni": "Copia de DNI/CE (ambas caras)", "carta_poder": "Carta poder firmada por el titular + copia de su DNI",
        "carta_poder_notarial": "Carta poder con firma legalizada notarialmente (Res. 132-2025-CD/OSIPTEL, art. 4) + copia del DNI del titular, o constancia de que eres su contacto autorizado",
        "carta_poder_simple": "Carta poder simple firmada por el titular + copia de su DNI",
        "dni_titular": "Copia del DNI del titular de la línea (si la tienes)",
        "recibo": "Último recibo o estado de cuenta", "propiedad": "Documento de propiedad o posesión"}

data = json.load(open(os.path.join(ROOT, "data", "services.json"), encoding="utf-8"))
rights = json.load(open(os.path.join(ROOT, "data", "rights.json"), encoding="utf-8"))
S, IND = data["servicios"], data["industrias"]
# Configuración del sitio (data/site.json). ADSENSE_CLIENT también se puede pasar por variable de entorno para pruebas.
site = json.load(open(os.path.join(ROOT, "data", "site.json"), encoding="utf-8"))
ADSENSE = (os.environ.get("ADSENSE_CLIENT") or site.get("adsense_client") or "").strip()
if ADSENSE and not re.fullmatch(r"ca-pub-\d{10,20}", ADSENSE):
    raise SystemExit(f"adsense_client inválido: {ADSENSE!r} (debe ser ca-pub-seguido de números)")
HAS_QR = os.path.exists(os.path.join(ROOT, "assets", "yape-qr.png"))
env = Environment(loader=FileSystemLoader(os.path.join(ROOT, "tools", "templates")), autoescape=select_autoescape(["html"]))
ver = datetime.datetime.now().strftime("%Y%m%d%H%M")
fecha = datetime.date.fromisoformat(data["actualizado"]).strftime("%d-%m-%Y")
# Tipo de trámite: baja (por defecto), robo (suspensión por robo o pérdida) o descuento (retención)
TIPOS = {"baja": {"accion": "Solicitar baja", "titulo": "Dar de baja {n}"},
         "robo": {"accion": "Pedir ayuda con el reporte", "titulo": "Suspensión por robo o pérdida: {n}"},
         "descuento": {"accion": "Pedir descuento", "titulo": "Pedir descuento o retención: {n}"}}
for s in data["servicios"]:
    s.setdefault("tipo", "baja"); s.setdefault("poder", "general"); s.setdefault("keywords", "")
CB = {"verde": "Digital (web, app, mail o chat)", "amarillo": "Por teléfono", "rojo": "Solo presencial"}
base = dict(TIPOS=TIPOS, CB=CB, BRAND=BRAND, TAGLINE=TAGLINE, RESPONSABLE=RESPONSABLE, INDUSTRIAS=IND, services=S, DOCS=DOCS,
            YEAR=datetime.date.today().year, ADSENSE=ADSENSE, HAS_QR=HAS_QR, V=ver, ACTUALIZADO=fecha)
form_data = {"docs": DOCS, "services": {s["id"]: {"nombre": s["nombre"], "industria": s["industria"], "id_label": s["id_label"],
             "adjuntos": s["adjuntos"], "requisitos": s["requisitos"], "canal": s["canal_baja"],
             "tipo": s["tipo"], "poder": s["poder"], "telefono": s.get("telefono", "")} for s in S}}

def write(rel, tpl, **kw):
    depth = rel.count("/")
    out = os.path.join(ROOT, rel); os.makedirs(os.path.dirname(out), exist_ok=True)
    html = env.get_template(tpl).render(**base, R="../" * depth or "./", **kw)
    open(out, "w", encoding="utf-8").write(html)

# Nota: si borras un servicio de services.json, borra también a mano su carpeta en servicio/ y solicitar/.
write("index.html", "index.html", counts={i: sum(s["industria"] == i for s in S) for i in IND})
write("privacidad/index.html", "privacy.html")
write("acerca-de/index.html", "acerca.html")
write("contacto/index.html", "contacto.html")
write("apoya/index.html", "apoya.html")
# ads.txt solo con AdSense activo (Google lo busca en la raíz del dominio)
ads_txt = os.path.join(ROOT, "ads.txt")
if ADSENSE:
    open(ads_txt, "w", encoding="utf-8").write(f"google.com, {ADSENSE.replace('ca-', '', 1)}, DIRECT, f08c47fec0942fa0\n")
elif os.path.exists(ads_txt):
    os.remove(ads_txt)
TELCO_DESC = {s["id"].replace("descuento-retencion-", ""): s["id"] for s in S if s["tipo"] == "descuento"}
revisa_data = [{"id": s["id"], "n": s["nombre"], "ind": s["industria"],
                "telco": s["industria"] == "Telecomunicaciones", "desc": TELCO_DESC.get(s["id"], "")}
               for s in S if s["tipo"] == "baja"]
write("revisa/index.html", "revisa.html", revisa_data=revisa_data)
write("solicitar/index.html", "form.html", svc=None, form_data=form_data)
for s in S:
    write(f"servicio/{s['id']}/index.html", "service.html", s=s, rights=rights[s["derechos"]])
    write(f"solicitar/{s['id']}/index.html", "form.html", svc=s, form_data=form_data)
shutil.copy(os.path.join(ROOT, "data", "services.json"), os.path.join(ROOT, "assets", "services.json"))
print(f"OK: {len(S)} servicios, {2*len(S)+7} páginas"+(" · AdSense ON" if ADSENSE else "")+f"")
