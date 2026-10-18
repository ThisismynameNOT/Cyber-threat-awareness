import unittest
from pathlib import Path
from email.parser import BytesParser
from email.policy import default
from html.parser import HTMLParser
import json

ROOT=Path(__file__).resolve().parents[1]
class Links(HTMLParser):
    def __init__(self):super().__init__();self.links=[];self.images=[];self.tags=[]
    def handle_starttag(self,tag,attrs):
        self.tags.append(tag);attrs=dict(attrs)
        if tag=='a':self.links.append(attrs.get('href'))
        if tag=='img':self.images.append(attrs.get('src'))

class PagesTests(unittest.TestCase):
    def test_existing_warning_and_education_survive_on_all_routes(self):
        for name in ['', 'utazas','politika','zongora']:
            with self.subTest(name=name):
                path=ROOT/'docs'/name/'index.html'
                self.assertTrue(path.is_file(),str(path))
                html=path.read_text()
                for phrase in ['Feltörtük','a fiókját.','Minden személyes adata nálunk van.','Adatok visszaszerzése','Ez egy oktatási szimuláció.','id="tanacsok"']:
                    self.assertIn(phrase,html)
                self.assertEqual(html.count('<li>'),4)
                self.assertNotIn('<form',html)

    def test_eml_files_have_embedded_photos_and_pages_links(self):
        for slug in ['utazas','politika','zongora']:
            with self.subTest(slug=slug):
                path=ROOT/'emails'/f'{slug}.eml'
                self.assertTrue(path.is_file(),str(path))
                msg=BytesParser(policy=default).parsebytes(path.read_bytes())
                self.assertFalse(msg.defects);self.assertTrue(str(msg['Subject']).startswith('[SZIMULÁCIÓ]'))
                self.assertEqual(msg['X-Unsent'],'1')
                self.assertIsNone(msg['To']);self.assertIsNone(msg['From'])
                html=msg.get_body(preferencelist=('html',)).get_content()
                plain=msg.get_body(preferencelist=('plain',)).get_content()
                parser=Links();parser.feed(html)
                expected=f'https://thisismynamenot.github.io/Cyber-threat-awareness/{slug}/?r={slug}-01'
                self.assertEqual(parser.links,[expected])
                self.assertIn(expected,plain)
                self.assertIn('SZIMULÁCIÓ',html.upper());self.assertIn('SZIMULÁCIÓ',plain.upper())
                self.assertIn('rögzíti a hivatkozás',html);self.assertIn('rögzíti a hivatkozás',plain)
                self.assertNotIn('chatgpt.site',html+plain)
                self.assertEqual(len(parser.images),1)
                self.assertTrue(parser.images[0].startswith('cid:'))
                self.assertTrue(any(p['Content-ID']=='<'+parser.images[0][4:]+'>' for p in msg.walk()))
                self.assertFalse({'input','script','form'}&set(parser.tags))
                self.assertEqual(path.read_bytes(),(ROOT/'docs/downloads'/path.name).read_bytes())

    def test_pages_has_no_server_or_credential_dependency(self):
        config=ROOT/'docs/tracking-config.json'
        self.assertTrue(config.is_file())
        settings=json.loads(config.read_text())
        self.assertTrue(settings['enabled'])
        self.assertEqual(settings['endpoint'],'https://iijkbeclmrvfejqogxey.supabase.co/functions/v1/awareness-tracker/events')
        self.assertEqual(set(settings['links']),{'utazas-01','politika-01','zongora-01','teszt'})
        for rid in settings['links'].values():self.assertRegex(rid,r'^[a-f0-9]{32}$')
        self.assertEqual(set(settings),{'enabled','endpoint','links'})
        self.assertTrue((ROOT/'docs/.nojekyll').exists())
        for path in (ROOT/'docs').rglob('*.html'):
            html=path.read_text()
            self.assertNotIn('chatgpt.site',html)
            self.assertNotIn('signin-with-chatgpt',html)
            if path.parent.name != 'results':self.assertNotIn('type="password"',html)

    def test_frontend_tracking_is_optional_and_uses_only_allowlisted_fields(self):
        path=ROOT/'docs/assets/tracker.js'
        self.assertTrue(path.is_file())
        script=path.read_text()
        self.assertIn('config.enabled',script)
        self.assertIn('campaign',script);self.assertIn('event',script)
        for forbidden in ['document.cookie','localStorage','userAgent','password','email:']:
            self.assertNotIn(forbidden,script)

if __name__=='__main__':unittest.main()
