#!/usr/bin/env python3
"""Uygulamayı tek bir HTML dosyasına paketler (claude.ai Artifact olarak yayınlamak için).

Kullanım: python3 tools/build_single.py cikti.html
CSS ve uygulama JS'i satır içine alınır; kütüphaneler cdnjs'den yüklenir.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CDN = {
    'vendor/xlsx.full.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    'vendor/jszip.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'vendor/exceljs.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js',
}


def main(out):
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    title = re.search(r'<title>.*?</title>', html).group(0)
    body = re.search(r'<body>(.*)</body>', html, re.S).group(1)
    css = (ROOT / 'css/app.css').read_text(encoding='utf-8')

    def script(m):
        src = m.group(1)
        if src in CDN:
            return '<script src="%s"></script>' % CDN[src]
        code = (ROOT / src).read_text(encoding='utf-8').replace('</script', '<\\/script')
        return '<script>\n%s\n</script>' % code

    body = re.sub(r'<script src="([^"]+)"></script>', script, body)
    Path(out).write_text('%s\n<style>\n%s</style>\n%s' % (title, css, body), encoding='utf-8')
    print('yazıldı:', out)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'iade-kabul.html')
