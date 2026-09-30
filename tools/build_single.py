#!/usr/bin/env python3
"""Uygulamayı tek bir HTML dosyasına paketler (claude.ai Artifact olarak yayınlamak için).

Kullanım:
  python3 tools/build_single.py cikti.html            # kütüphaneler cdnjs'den (claude.ai Artifact için)
  python3 tools/build_single.py --offline cikti.html  # kütüphaneler de gömülü; çift tıklayıp açılan,
                                                      # internetsiz çalışan bilgisayar sürümü (canlı kamera)
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


def main(out, offline=False):
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    title = re.search(r'<title>.*?</title>', html).group(0)
    body = re.search(r'<body>(.*)</body>', html, re.S).group(1)
    css = (ROOT / 'css/app.css').read_text(encoding='utf-8')

    def script(m):
        src = m.group(1)
        if src in CDN and not offline:
            return '<script src="%s"></script>' % CDN[src]
        code = (ROOT / src).read_text(encoding='utf-8').replace('</script', '<\\/script')
        return '<script>\n%s\n</script>' % code

    body = re.sub(r'<script src="([^"]+)"></script>', script, body)
    page = '%s\n<style>\n%s</style>\n%s' % (title, css, body)
    if offline:
        # Doğrudan açılan dosya: tam belge + UTF-8 (Türkçe karakterler için şart)
        page = ('<!doctype html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n'
                '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
                '%s\n<style>\n%s</style>\n</head>\n<body>%s</body>\n</html>\n' % (title, css, body))
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    Path(out).write_text(page, encoding='utf-8')
    print('yazıldı:', out)


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if a != '--offline']
    main(args[0] if args else 'iade-kabul.html', offline='--offline' in sys.argv)
