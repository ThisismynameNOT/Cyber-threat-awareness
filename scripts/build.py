"""Build static Pages routes and Outlook EMLs using only Python's standard library."""
from pathlib import Path
from email.message import EmailMessage
from email.policy import SMTP
import json,re,shutil

ROOT=Path(__file__).resolve().parents[1]
BASE='https://thisismynamenot.github.io/Cyber-threat-awareness/'
SUBJECTS=json.loads((ROOT/'emails/subjects.json').read_text())

def main():
    config=json.loads((ROOT/'docs/tracking-config.json').read_text())
    tracking=bool(config.get('enabled') and config.get('endpoint') and config.get('links'))
    notice='A gyakorlat rögzíti a hivatkozás betöltését és az oktatási gomb használatát.'
    landing=(ROOT/'site/landing.html').read_text()
    for slug in ['',*SUBJECTS]:
        folder=ROOT/'docs'/slug;folder.mkdir(parents=True,exist_ok=True)
        campaign=slug+'-01' if slug else 'teszt'
        asset='../assets/tracker.js' if slug else 'assets/tracker.js'
        page=landing.replace('<body>',f'<body data-campaign="{campaign}">').replace('</body>',f'<script src="{asset}" defer></script>\n</body>')
        (folder/'index.html').write_text(page)
    for slug,subject in SUBJECTS.items():
        url=BASE+slug+'/?r='+slug+'-01'
        photo=(ROOT/'emails/assets'/f'{slug}.jpg').read_bytes()
        html=(ROOT/'emails/source'/f'{slug}.html').read_text().replace('{{TRAINING_URL}}',url)
        plain=(ROOT/'emails/source'/f'{slug}.txt').read_text().replace('{{TRAINING_URL}}',url)
        if tracking:
            html=html.replace('</body>', '<p style="margin:20px auto;max-width:600px;padding:0 24px;color:#484741;font:13px/1.6 Arial,sans-serif;">'+notice+'</p></body>')
            plain+='\n'+notice+'\n'
        cid=slug+'-awareness-hero'
        msg=EmailMessage(policy=SMTP)
        msg['Subject']=subject;msg['X-Unsent']='1'
        msg.set_content(plain,charset='utf-8')
        msg.add_alternative(html.replace('{{HERO}}','cid:'+cid),subtype='html',charset='utf-8')
        msg.get_payload()[-1].add_related(photo,maintype='image',subtype='jpeg',cid='<'+cid+'>',filename=slug+'.jpg',disposition='inline')
        for i,part in enumerate(msg.walk()):
            if part.is_multipart():part.set_boundary('awareness-'+slug+'-'+str(i))
        out=ROOT/'emails'/f'{slug}.eml';out.write_bytes(msg.as_bytes())
        shutil.copy2(out,ROOT/'docs/downloads'/out.name)
        (ROOT/'docs/templates'/f'{slug}.html').write_text(html.replace('{{HERO}}','../assets/'+slug+'.jpg'))
        shutil.copy2(ROOT/'emails/assets'/f'{slug}.jpg',ROOT/'docs/assets'/f'{slug}.jpg')
    cards=''.join(f'<article><h2>{label}</h2><p><a href="{slug}.html">Levél előnézete</a></p><p><a href="../downloads/{slug}.eml" download>Outlook-levél letöltése (.eml)</a></p><p><a href="../{slug}/">Oktatási oldal</a></p></article>' for slug,label in [('utazas','Utazás'),('politika','Politika'),('zongora','Zongora')])
    tracking_status=notice if tracking else 'A kattintásszámlálás jelenleg nincs bekapcsolva.'
    (ROOT/'docs/templates/index.html').write_text('<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Magyar oktatási levélminták</title><style>body{margin:0;background:#101011;color:#f5f3ef;font:18px/1.6 Arial,sans-serif;border-top:5px solid #ff6257}main{max-width:900px;margin:auto;padding:36px 24px}h1{line-height:1.2}a{color:#ff887f;text-underline-offset:4px}article{border-top:1px solid #49413f;margin-top:24px;padding:16px 0}p{margin:10px 0}</style></head><body><main><p>OKTATÁSI SZIMULÁCIÓ</p><h1>Magyar levélminták.</h1><p>A három levél külön témájú, ugyanahhoz a kiberbiztonsági útmutatóhoz vezet.</p>'+cards+'<p>'+tracking_status+'</p><p><a href="../results/">Tulajdonosi eredmények</a></p></main></body></html>')
    print('Built 4 training routes, 3 EMLs, and 3 HTML email previews.')

if __name__=='__main__':main()
