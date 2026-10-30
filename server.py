"""
╔══════════════════════════════════════════════════════════╗
║  HETRON AI — Programs Dock Server                        ║
║  Run:  python server.py                                  ║
║  Port: http://localhost:5050                             ║
╚══════════════════════════════════════════════════════════╝
"""

import sys
import subprocess
import threading
import queue
import json
import os
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

BASE = Path(__file__).parent

# ── Registry of runnable programs ─────────────────────────────────
PROGRAMS = {
    "refactor": {
        "label":  "Refactor Script",
        "icon":   "🔧",
        "desc":   "Splits index.html → style.css + script.js",
        "script": str(BASE / "refactor.py"),
        "args":   [],
        "interactive": False,
    },
    "voice_search": {
        "label":  "Voice File Search",
        "icon":   "🎙",
        "desc":   "Voice-controlled file search assistant",
        "script": str(BASE / "voice_file_search.py"),
        "args":   [],
        "interactive": True,
    },
}

# ── Active process registry ────────────────────────────────────────
_procs: dict[str, subprocess.Popen] = {}
_proc_lock = threading.Lock()

# ── CORS helper ───────────────────────────────────────────────────
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


class DockHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # suppress default access log noise

    def _cors(self):
        for k, v in CORS_HEADERS.items():
            self.send_header(k, v)

    def _json(self, data, code=200):
        body = json.dumps(data).encode()
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    # ── OPTIONS (preflight) ────────────────────────────────────────
    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    # ── GET ────────────────────────────────────────────────────────
    def do_GET(self):
        parsed = urlparse(self.path)
        path   = parsed.path.rstrip("/")
        qs     = parse_qs(parsed.query)

        # /programs  — list all programs
        if path == "/programs":
            payload = {
                pid: {k: v for k, v in info.items() if k != "script"}
                for pid, info in PROGRAMS.items()
            }
            self._json(payload)
            return

        # /run?id=<pid>  — start a program, stream SSE output
        if path == "/run":
            pid = qs.get("id", [None])[0]
            if pid not in PROGRAMS:
                self._json({"error": "Unknown program id"}, 404)
                return
            self._stream_run(pid)
            return

        # /kill?id=<pid>  — kill a running program
        if path == "/kill":
            pid = qs.get("id", [None])[0]
            with _proc_lock:
                proc = _procs.pop(pid, None)
            if proc:
                proc.kill()
                self._json({"ok": True, "msg": f"Killed {pid}"})
            else:
                self._json({"ok": False, "msg": "Not running"})
            return

        # /status?id=<pid>
        if path == "/status":
            pid = qs.get("id", [None])[0]
            with _proc_lock:
                alive = pid in _procs and _procs[pid].poll() is None
            self._json({"running": alive})
            return

        # /system?action=<shutdown|restart|sleep|lock>&confirm=yes
        if path == "/system":
            action  = qs.get("action", [None])[0]
            confirm = qs.get("confirm", [""])[0]
            if confirm != "yes":
                self._json({"error": "Missing confirm=yes parameter"}, 400)
                return

            COMMANDS = {
                "shutdown": ["shutdown", "/s", "/t", "5"],
                "restart":  ["shutdown", "/r", "/t", "5"],
                "sleep":    ["rundll32.exe", "powrprof.dll,SetSuspendState", "0,1,0"],
                "lock":     ["rundll32.exe", "user32.dll,LockWorkStation"],
                "cancel":   ["shutdown", "/a"],
            }

            if action not in COMMANDS:
                self._json({"error": f"Unknown action: {action}. Use: {', '.join(COMMANDS.keys())}"}, 400)
                return

            try:
                subprocess.Popen(COMMANDS[action], shell=True)
                self._json({"ok": True, "action": action, "msg": f"System {action} initiated"})
                print(f"  ⚡ System command executed: {action}")
            except Exception as e:
                self._json({"ok": False, "error": str(e)})
            return

        # ── Static file serving for web UI ────────────────────────────
        rel_path = path.lstrip("/") or "index.html"
        file_path = BASE / rel_path
        if file_path.is_file() and file_path.resolve().is_relative_to(BASE.resolve()):
            content_types = {
                ".html": "text/html; charset=utf-8",
                ".css":  "text/css; charset=utf-8",
                ".js":   "application/javascript; charset=utf-8",
                ".json": "application/json; charset=utf-8",
                ".png":  "image/png",
                ".jpg":  "image/jpeg",
                ".svg":  "image/svg+xml",
                ".ico":  "image/x-icon",
            }
            mime = content_types.get(file_path.suffix.lower(), "application/octet-stream")
            try:
                data = file_path.read_bytes()
                self.send_response(200)
                self._cors()
                self.send_header("Content-Type", mime)
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return
            except Exception as e:
                self._json({"error": str(e)}, 500)
                return

        self._json({"error": "Not found"}, 404)

    # ── POST /stdin — send text to a running process ───────────────
    def do_POST(self):
        parsed = urlparse(self.path)
        path   = parsed.path.rstrip("/")
        qs     = parse_qs(parsed.query)

        if path == "/stdin":
            pid  = qs.get("id", [None])[0]
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode(errors="replace")
            with _proc_lock:
                proc = _procs.get(pid)
            if proc and proc.poll() is None:
                try:
                    proc.stdin.write((body + "\n").encode())
                    proc.stdin.flush()
                    self._json({"ok": True})
                except Exception as e:
                    self._json({"ok": False, "error": str(e)})
            else:
                self._json({"ok": False, "error": "Process not running"})
            return

        self._json({"error": "Not found"}, 404)

    # ── SSE streaming helper ───────────────────────────────────────
    def _stream_run(self, pid: str):
        info = PROGRAMS[pid]

        # Kill any existing instance first
        with _proc_lock:
            old = _procs.pop(pid, None)
        if old:
            old.kill()

        cmd = [sys.executable, "-u", info["script"]] + info["args"]
        env = os.environ.copy()
        env["PYTHONIOENCODING"] = "utf-8"
        env["PYTHONUTF8"]       = "1"

        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            stdin=subprocess.PIPE if info["interactive"] else subprocess.DEVNULL,
            cwd=str(BASE),
            env=env,
        )
        with _proc_lock:
            _procs[pid] = proc

        # Send SSE headers
        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control",  "no-cache")
        self.send_header("X-Accel-Buffering", "no")
        self.end_headers()

        def send_event(data: str, event: str = "msg"):
            try:
                for line in data.splitlines():
                    msg = f"event: {event}\ndata: {json.dumps(line)}\n\n"
                    self.wfile.write(msg.encode())
                self.wfile.flush()
            except Exception:
                pass

        send_event(f"▶  Starting: {info['label']} ...", "start")

        # Read stdout line by line
        try:
            for raw_line in proc.stdout:
                line = raw_line.decode("utf-8", errors="replace").rstrip("\r\n")
                send_event(line)
        except Exception:
            pass

        proc.wait()
        rc = proc.returncode
        with _proc_lock:
            _procs.pop(pid, None)

        if rc == 0:
            send_event(f"✅  Process exited successfully (code 0)", "done")
        else:
            send_event(f"⚠  Process exited with code {rc}", "done")


# ── Entry point ───────────────────────────────────────────────────
if __name__ == "__main__":
    PORT = 5050
    server = HTTPServer(("localhost", PORT), DockHandler)
    print(f"\n{'='*55}")
    print(f"  HETRON AI — Programs Dock Server")
    print(f"  Listening on  http://localhost:{PORT}")
    print(f"  Press Ctrl+C to stop")
    print(f"{'='*55}\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
