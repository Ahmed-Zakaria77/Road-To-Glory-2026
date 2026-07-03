#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
from datetime import datetime, timezone
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

import fcntl


ROOT_DIR = Path(__file__).resolve().parent
STATE_FILE = ROOT_DIR / ".shared-state.json"
API_PATH = "/api/shared-state"
ADMIN_PASSWORD_SHA256 = "556ea1b2f7420f2cd4e6d1d548f7389cdaf91535020c5917e16d2b3bf6b98844"
ADMIN_TOKEN_SECRET = "wc2026-admin-token-v1"


def build_default_envelope() -> dict:
    return {
        "ok": True,
        "revision": 0,
        "updatedAt": None,
        "state": None,
    }


def read_envelope_locked(file_obj) -> dict | None:
    file_obj.seek(0)
    raw = file_obj.read().strip()
    if not raw:
        return None

    decoded = json.loads(raw)
    if not isinstance(decoded, dict) or "state" not in decoded:
        return None

    decoded["ok"] = True
    decoded["revision"] = int(decoded.get("revision", 0))
    decoded["updatedAt"] = decoded.get("updatedAt")
    return decoded


def sanitize_state(state) -> dict | None:
    if not isinstance(state, dict):
        return None

    required = ["players", "groups", "matches", "matchPredictions", "groupPredictions"]
    for key in required:
        if key not in state or not isinstance(state[key], list):
            return None

    return {
        "players": list(state["players"]),
        "groups": list(state["groups"]),
        "matches": list(state["matches"]),
        "matchPredictions": list(state["matchPredictions"]),
        "groupPredictions": list(state["groupPredictions"]),
        "scheduleVersion": str(state.get("scheduleVersion", "")),
    }


def build_admin_session_version() -> str:
    latest_mtime_ns = 0
    for path in ROOT_DIR.iterdir():
        if path.is_file() and path.suffix in {".html", ".js", ".css", ".php", ".py"}:
            latest_mtime_ns = max(latest_mtime_ns, path.stat().st_mtime_ns)

    if latest_mtime_ns <= 0:
        latest_mtime_ns = ROOT_DIR.joinpath("server.py").stat().st_mtime_ns

    return str(latest_mtime_ns)


def build_admin_session_token(version: str) -> str:
    return hashlib.sha256(f"{version}:{ADMIN_TOKEN_SECRET}".encode("utf-8")).hexdigest()


def authenticate_admin(password: str) -> dict:
    password_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()
    if password_hash != ADMIN_PASSWORD_SHA256:
        return {
            "ok": False,
            "error": "invalid_admin_password",
            "message": "Wrong admin password.",
        }

    version = build_admin_session_version()
    return {
        "ok": True,
        "adminSessionToken": build_admin_session_token(version),
        "adminSessionVersion": version,
    }


def build_admin_status(token: str) -> dict:
    version = build_admin_session_version()
    return {
        "ok": True,
        "valid": bool(token) and token == build_admin_session_token(version),
        "adminSessionVersion": version,
    }


class WC2026Handler(SimpleHTTPRequestHandler):
    server_version = "WC2026Server/1.0"

    def end_headers(self) -> None:
        if self.path.startswith(API_PATH):
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        super().end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == API_PATH:
            self.respond_json(load_envelope())
            return
        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != API_PATH:
            self.respond_json(
                {
                    "ok": False,
                    "error": "not_found",
                    "message": "Unknown endpoint.",
                },
                status=HTTPStatus.NOT_FOUND,
            )
            return

        length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(length).decode("utf-8") if length > 0 else ""

        try:
            payload = json.loads(raw_body or "{}")
        except json.JSONDecodeError:
            self.respond_json(
                {
                    "ok": False,
                    "error": "invalid_json",
                    "message": "Request body must be valid JSON.",
                },
                status=HTTPStatus.BAD_REQUEST,
            )
            return

        action = payload.get("action")
        if action == "authenticateAdmin":
            result = authenticate_admin(str(payload.get("password", "")))
            status = HTTPStatus.OK if result.get("ok") else HTTPStatus.UNAUTHORIZED
            self.respond_json(result, status=status)
            return

        if action == "adminStatus":
            self.respond_json(build_admin_status(str(payload.get("token", ""))))
            return

        if action != "replaceState":
            self.respond_json(
                {
                    "ok": False,
                    "error": "unsupported_action",
                    "message": "Supported actions are replaceState, authenticateAdmin, and adminStatus.",
                },
                status=HTTPStatus.BAD_REQUEST,
            )
            return

        sanitized = sanitize_state(payload.get("state"))
        if sanitized is None:
            self.respond_json(
                {
                    "ok": False,
                    "error": "invalid_state",
                    "message": "State payload is missing required collections.",
                },
                status=HTTPStatus.BAD_REQUEST,
            )
            return

        base_revision = int(payload.get("baseRevision", 0))
        self.respond_json(commit_state(sanitized, base_revision))

    def log_message(self, format: str, *args) -> None:
        print(f"[{self.log_date_time_string()}] {self.address_string()} {format % args}")

    def respond_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=True).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def load_envelope() -> dict:
    if not STATE_FILE.exists():
        return build_default_envelope()

    with STATE_FILE.open("a+", encoding="utf-8") as file_obj:
        fcntl.flock(file_obj.fileno(), fcntl.LOCK_SH)
        try:
            envelope = read_envelope_locked(file_obj)
        finally:
            fcntl.flock(file_obj.fileno(), fcntl.LOCK_UN)

    return envelope or build_default_envelope()


def commit_state(state: dict, base_revision: int) -> dict:
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)

    with STATE_FILE.open("a+", encoding="utf-8") as file_obj:
        fcntl.flock(file_obj.fileno(), fcntl.LOCK_EX)
        try:
            current = read_envelope_locked(file_obj)
            current_revision = int((current or {}).get("revision", 0))

            if current is not None and base_revision != current_revision:
                return {
                    "ok": False,
                    "error": "revision_conflict",
                    "message": "The shared state changed before this save completed.",
                    "conflict": True,
                    "revision": current_revision,
                    "state": current["state"],
                }

            next_envelope = {
                "ok": True,
                "revision": current_revision + 1,
                "updatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "state": state,
            }

            file_obj.seek(0)
            file_obj.truncate()
            json.dump(next_envelope, file_obj, ensure_ascii=True)
            file_obj.flush()
            os.fsync(file_obj.fileno())
            return next_envelope
        finally:
            fcntl.flock(file_obj.fileno(), fcntl.LOCK_UN)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the WC2026 local shared-state server.")
    parser.add_argument("--host", default="0.0.0.0", help="Bind host. Default: 0.0.0.0")
    parser.add_argument("--port", type=int, default=8011, help="Bind port. Default: 8011")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    handler = partial(WC2026Handler, directory=str(ROOT_DIR))
    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f"WC2026 server running at http://{args.host}:{args.port}")
    print(f"Serving files from: {ROOT_DIR}")
    print(f"Shared API endpoint: {API_PATH}")
    server.serve_forever()


if __name__ == "__main__":
    main()
