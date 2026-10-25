#!/usr/bin/env python3
"""Genera el sitio estático de DeBaja.pe a partir de data/services.json y data/rights.json.
Uso:  pip install jinja2  &&  python tools/build.py
Escribe index.html, servicio/<id>/index.html, solicitar/[<id>/]index.html y privacidad/index.html.
Todas las rutas son relativas, así funciona en https://<usuario>.github.io/<repo>/ o en un dominio propio."""
import json, os, shutil, datetime
from jinja2 import Environment, FileSystemLoader, select_autoescape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = "DeBaja.pe"
TAGLINE = "Damos de baja tus servicios y suscripciones, sin colas ni vueltas."
RESPONSABLE = "Gabriel Pizarro"  # titular del banco de datos (Ley 29733)
DOCS = {"dni": "Copia de DNI/CE (ambas caras)", "carta_poder": "Carta poder firmada por el titular + copia de su DNI",
        "recibo": "Último recibo o estado de cuenta", "propiedad": "Documento de propiedad o posesión"}

data = json.load(open(os.path.join(ROOT, "data", "services.json"), encoding="utf-8"))
rights = json.load(open(os.path.join(ROOT, "data", "rights.json"), encoding="utf-8"))
S, IND = data["servicios"], data["industrias"]
env = Environment(loader=FileSystemLoader(os.path.join(ROOT, "tools", "templates")), autoescape=select_autoescape(["html"]))
ver = datetime.datetime.now().strftime("%Y%m%d%H%M")
fecha = datetime.date.fromisoformat(data["actualizado"]).strftime("%d-%m-%Y")
CB = {"verde": "Digital (web, app, mail o chat)", "amarillo": "Por teléfono", "rojo": "Solo presencial"}
base = dict(CB=CB, BRAND=BRAND, TAGLINE=TAGLINE, RESPONSABLE=RESPONSABLE, INDUSTRIAS=IND, services=S, DOCS=DOCS,
            YEAR=datetime.date.today().year, V=ver, ACTUALIZADO=fecha)
form_data = {"docs": DOCS, "services": {s["id"]: {"nombre": s["nombre"], "industria": s["industria"], "id_label": s["id_label"],
             "adjuntos": s["adjuntos"], "requisitos": s["requisitos"], "canal": s["canal_baja"]} for s in S}}

def write(rel, tpl, **kw):
    depth = rel.count("/")
    out = os.path.join(ROOT, rel); os.makedirs(os.path.dirname(out), exist_ok=True)
    html = env.get_template(tpl).render(**base, R="../" * depth or "./", **kw)
    open(out, "w", encoding="utf-8").write(html)

# Nota: si borras un servicio de services.json, borra también a mano su carpeta en servicio/ y solicitar/.
write("index.html", "index.html", counts={i: sum(s["industria"] == i for s in S) for i in IND})
write("privacidad/index.html", "privacy.html")
write("solicitar/index.html", "form.html", svc=None, form_data=form_data)
for s in S:
    write(f"servicio/{s['id']}/index.html", "service.html", s=s, rights=rights[s["derechos"]])
    write(f"solicitar/{s['id']}/index.html", "form.html", svc=s, form_data=form_data)
shutil.copy(os.path.join(ROOT, "data", "services.json"), os.path.join(ROOT, "assets", "services.json"))
print(f"OK: {len(S)} servicios, {2*len(S)+3} páginas")
