#!/usr/bin/env python3
"""Compatibility launcher for the canonical TypeScript KDF validator.

Business rules live only in mcp-servers/kdf-chatgpt-bridge. This script preserves the
existing repository command for humans and older automation.
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path


REPO = Path(__file__).resolve().parents[1]
PACKAGE = REPO / "mcp-servers" / "kdf-chatgpt-bridge"
DIST_CLI = PACKAGE / "dist" / "cli.js"


def main() -> int:
    node = shutil.which("node")
    if not node:
        print("KDF validation blocked: Node.js was not found.", file=sys.stderr)
        return 2

    if not DIST_CLI.exists():
        npm = shutil.which("npm.cmd") or shutil.which("npm")
        if not npm:
            print("KDF validation blocked: bridge is not built and npm was not found.", file=sys.stderr)
            return 2
        build = subprocess.run([npm, "run", "build"], cwd=PACKAGE, check=False)
        if build.returncode:
            return build.returncode

    completed = subprocess.run([node, str(DIST_CLI), "validate"], cwd=PACKAGE, check=False)
    return completed.returncode


if __name__ == "__main__":
    raise SystemExit(main())
