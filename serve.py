#!/usr/bin/env python3
"""Serveur local Diego — avec endpoint upload pour transfert inter-containers."""
import http.server, socketserver, os

PORT = 8080
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/upload':
            length = int(self.headers.get('Content-Length', 0))
            body   = self.rfile.read(length)
            fname  = self.headers.get('X-Filename', 'upload.bin')
            dest   = os.path.join('wallpaper', fname)
            open(dest, 'wb').write(body)
            self.send_response(200); self.end_headers()
            self.wfile.write(b'OK ' + str(len(body)).encode())
        else:
            self.send_response(404); self.end_headers()
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    def log_message(self, fmt, *args): pass

print(f"Serveur : http://localhost:{PORT}")
with socketserver.TCPServer(('', PORT), Handler) as httpd:
    httpd.serve_forever()
