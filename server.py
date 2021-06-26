import http.server
import socketserver
import os

PORT = 8000

web_dir = "J:/texturelabs/thumb"#os.path.join(os.path.dirname(__file__), 'web')
os.chdir(web_dir)

Handler = http.server.SimpleHTTPRequestHandler
httpd = socketserver.TCPServer(("", PORT), Handler)

def start():
    print("serving at port", PORT)
    httpd.serve_forever()

    