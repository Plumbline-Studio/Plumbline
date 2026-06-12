#!/usr/bin/env python3
"""
Regenerate the QR code in index.html after you know the card's final hosted URL.

Usage (run from the folder containing the target index.html):
    pip install qrcode --break-system-packages
    python3 regen_qr.py "https://your-final-card-url"

It rewrites the <path d="..."> inside the .qr <svg> in index.html in place.
"""
import re, sys, qrcode, qrcode.image.svg

if len(sys.argv) < 2:
    sys.exit('Pass the final card URL, e.g. python3 regen_qr.py "https://plumbline.example/card"')

url = sys.argv[1]
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=0)
qr.add_data(url)
qr.make(fit=True)
svg = qr.make_image(image_factory=qrcode.image.svg.SvgPathImage)
svg.save('_qr_tmp.svg')
raw = open('_qr_tmp.svg').read()
viewbox = re.search(r'viewBox="([^"]+)"', raw).group(1)
path = re.search(r'd="([^"]+)"', raw).group(1)

html = open('index.html').read()
# replace the qr svg's viewBox and path
html = re.sub(r'(class="qr" viewBox=")[^"]+(")', r'\g<1>' + viewbox + r'\g<2>', html, count=1)
html = re.sub(r'(<path d=")[^"]+(" fill="#f3f6fa")', r'\g<1>' + path + r'\g<2>', html, count=1)
open('index.html', 'w').write(html)
print(f'QR updated to encode: {url}')
