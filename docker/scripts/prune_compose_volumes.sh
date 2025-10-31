#!/usr/bin/env bash
# prune_compose_volumes.sh
# Remove only volumes referenced by a selected Docker Compose file in this repo.
# This runs `docker compose -f <compose-file> down --volumes --remove-orphans`.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILES=("$ROOT_DIR/docker-compose.hub.yml" "$ROOT_DIR/docker-compose.yml")
AVAILABLE=()
for f in "${COMPOSE_FILES[@]}"; do
  [ -f "$f" ] && AVAILABLE+=("$f")
done

if [ ${#AVAILABLE[@]} -eq 0 ]; then
  echo "No compose files found in $ROOT_DIR. Expected docker-compose.hub.yml or docker-compose.yml"
  exit 1
fi

echo "Found compose file(s):"
for i in "${!AVAILABLE[@]}"; do
  echo "  [$((i+1))] ${AVAILABLE[$i]}"
done

read -rp "Choose a number to run (default 1): " CHOICE
CHOICE=${CHOICE:-1}
if ! [[ "$CHOICE" =~ ^[0-9]+$ ]] || [ "$CHOICE" -lt 1 ] || [ "$CHOICE" -gt ${#AVAILABLE[@]} ]; then
  echo "Invalid choice"; exit 1
fi
TARGET=${AVAILABLE[$((CHOICE-1))]}

echo "Selected: $TARGET"

echo "Previewing named volumes from the compose file (if any):"
grep -E "^\s+[a-zA-Z0-9_-]+:\s*$" -n "$TARGET" | sed -n '1,200p' || true

echo
read -rp "This will run: docker compose -f '$TARGET' down --volumes --remove-orphans\nProceed? [y/N] " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "Aborting."; exit 0
fi

echo "Running docker compose down..."
docker compose -f "$TARGET" down --volumes --remove-orphans

echo "Done. Named volumes declared in $TARGET have been removed (if present)."

