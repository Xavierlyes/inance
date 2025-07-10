
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
import socketserver

PORT = 5000

class MyHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

if __name__ == "__main__":
    web_dir = os.path.join(os.path.dirname(__file__))
    os.chdir(web_dir)
    
    with socketserver.TCPServer(("0.0.0.0", PORT), MyHTTPRequestHandler) as httpd:
        print(f"Server running at http://0.0.0.0:{PORT}")
        print(f"Visit your dashboard at: http://0.0.0.0:{PORT}/dashboard.html")
        httpd.serve_forever()
