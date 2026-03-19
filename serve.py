#!/usr/bin/env python3
"""
Lance un serveur HTTP local pour Diego's Adventure.
Accès : http://localhost:8080
Ctrl+C pour arrêter.
"""
import http.server, socketserver, os

PORT = 8080
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Désactiver le cache navigateur complètement
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    def log_message(self, fmt, *args):
        pass  # silencieux

print(f"Jeu disponible sur : http://localhost:{PORT}")
print("Ctrl+C pour arrêter.")
with socketserver.TCPServer(('', PORT), Handler) as httpd:
    httpd.serve_forever()
