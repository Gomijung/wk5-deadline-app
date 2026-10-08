from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
PORT = 4173
handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))

if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    print(f"틈 모바일 웹 프로토타입: http://localhost:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n서버를 종료했습니다.")
    finally:
        server.server_close()
