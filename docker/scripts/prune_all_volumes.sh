#!/bin/sh
# prune_all_volumes.sh
# Danger: this script will delete ALL Docker volumes on the host. Use with extreme care.
# Location: docker/scripts/prune_all_volumes.sh

set -eu

echo "---------------------------------------------------------------------"
echo "WARNING: This will permanently delete ALL Docker volumes on this machine."
echo "If you only want to remove volumes created by this compose file, run the project-specific command instead:"
echo "   docker compose -f ../docker-compose.hub.yml down --volumes --remove-orphans"
echo "---------------------------------------------------------------------"

echo "Type 'YES' to proceed:"
read CONFIRM
if [ "$CONFIRM" != "YES" ]; then
  echo "Aborting.";
  exit 0
fi

echo "Stopping all containers (best-effort)..."
docker ps -q | xargs -r docker stop || true

echo "Removing all containers (best-effort)..."
docker ps -aq | xargs -r docker rm -f || true

echo "Listing volumes to remove:"
docker volume ls -q

echo "Removing all Docker volumes..."
docker volume ls -q | xargs -r -n1 docker volume rm -f || true

echo "Done."

