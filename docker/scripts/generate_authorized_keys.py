#!/usr/bin/env python3
"""
Simple helper to add your SSH public key into scripts/ssh/authorized_keys in this repo.
Usage:
  - Interactive: python generate_authorized_keys.py
  - One-liner: python generate_authorized_keys.py --pubkey "ssh-ed25519 AAAA... user@host"

The script will create the directory `scripts/ssh` if missing, append the key only if it's not already present,
set reasonable file permissions (600 on Unix), and print next steps (rebuild image or copy into running container).
"""
import argparse
import os
import sys
from pathlib import Path

# default: repo_root/scripts/ssh
DEFAULT_DIR = Path(__file__).resolve().parents[2] / "scripts" / "ssh"
AUTH_KEYS = DEFAULT_DIR / "authorized_keys"

KEY_PREFIXES = ("ssh-", "ecdsa-", "sk-")


def validate_key(s: str) -> bool:
    s = s.strip()
    if not s:
        return False
    # basic check: starts with known prefix and has at least two fields
    parts = s.split()
    if len(parts) < 2:
        return False
    if not any(parts[0].startswith(p) for p in KEY_PREFIXES):
        return False
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pubkey", help="Public SSH key string to add to authorized_keys")
    parser.add_argument("--force", action="store_true", help="Force adding even if duplicate check fails")
    args = parser.parse_args()

    pubkey = args.pubkey
    if not pubkey:
        print("Paste your public SSH key (one line) and press Enter, or Ctrl+D to cancel:")
        try:
            pubkey = sys.stdin.readline().strip()
        except KeyboardInterrupt:
            print("\nCancelled")
            sys.exit(1)

    if not pubkey:
        print("No public key provided. Exiting.")
        sys.exit(1)

    if not validate_key(pubkey):
        if not args.force:
            print("Provided string doesn't look like a valid public SSH key. Use --force to override.")
            sys.exit(2)
        else:
            print("Warning: adding key even though basic validation failed (--force used).")

    # ensure directory exists
    DEFAULT_DIR.mkdir(parents=True, exist_ok=True)

    # read existing keys
    existing = []
    if AUTH_KEYS.exists():
        existing = [line.strip() for line in AUTH_KEYS.read_text(encoding='utf-8').splitlines() if line.strip()]

    if pubkey in existing:
        print(f"Key already present in {AUTH_KEYS}")
    else:
        # append
        with AUTH_KEYS.open("a", encoding='utf-8') as f:
            if existing:
                f.write("\n")
            f.write(pubkey.strip() + "\n")
        print(f"Added key to {AUTH_KEYS}")

    # set permissions (POSIX only)
    try:
        os.chmod(AUTH_KEYS, 0o600)
    except Exception:
        # Windows or permission denied - ignore
        pass

    print("Next steps:")
    print("  - If you want the key baked into the image, rebuild with:")
    print("      cd docker && docker-compose up -d --build messaging-service")
    print("  - Or copy the public key into a running container:")
    print("      docker cp scripts/ssh/authorized_keys messaging_service:/tmp/authorized_keys")
    print("      docker exec -u root messaging_service sh -c 'mkdir -p /home/dev/.ssh && cat /tmp/authorized_keys >> /home/dev/.ssh/authorized_keys && chown -R dev:dev /home/dev/.ssh && chmod 600 /home/dev/.ssh/authorized_keys && rm /tmp/authorized_keys'")


if __name__ == '__main__':
    main()
