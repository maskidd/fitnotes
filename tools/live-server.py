"""Live preview of dist/ for phone and browser.

Serves the app on the local network and reloads every open page about a second
after any file in dist/ changes. Run: python3 tools/live-server.py [port]
"""
import http.server
import os
import socket
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist')
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8800

# Polls the server and reloads the page when the files' fingerprint changes.
RELOAD = b"""<script>(()=>{let seen=null;setInterval(async()=>{try{const v=await (await fetch('/__live',{cache:'no-store'})).text();if(seen&&v!==seen)location.reload();seen=v;}catch(e){}},1000);})();</script>"""


def fingerprint():
    parts = []
    for base, _, files in os.walk(ROOT):
        for name in files:
            path = os.path.join(base, name)
            stat = os.stat(path)
            parts.append(f'{path}:{stat.st_mtime_ns}:{stat.st_size}')
    return str(hash('|'.join(sorted(parts))))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # Never cache during live preview, so a reload always gets the newest files.
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        if self.path == '/__live':
            body = fingerprint().encode()
        elif self.path.split('?')[0] in ('/', '/index.html'):
            with open(os.path.join(ROOT, 'index.html'), 'rb') as f:
                body = f.read().replace(b'</body>', RELOAD + b'</body>')
        else:
            return super().do_GET()
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8' if self.path != '/__live' else 'text/plain')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


def local_ip():
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        try:
            s.connect(('10.255.255.255', 1))
            return s.getsockname()[0]
        except OSError:
            return '127.0.0.1'


if __name__ == '__main__':
    print(f'FitNotes live: http://localhost:{PORT}  ·  telefon: http://{local_ip()}:{PORT}', flush=True)
    http.server.ThreadingHTTPServer(('0.0.0.0', PORT), Handler).serve_forever()
