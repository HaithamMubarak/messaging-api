#!/usr/bin/env bash
set -euo pipefail

# push_messaging_service.sh
# Tag/build and push the messaging-service Docker image.
# Usage:
#   ./push_messaging_service.sh [<local-image>] [<dest-repo:tag>]
# Examples:
#   ./push_messaging_service.sh
#   ./push_messaging_service.sh my-image:latest haithammubarak/messaging-platform:messaging-service

LOCAL_IMAGE="${1:-messaging-platform/messaging-service:latest}"
DEST="${2:-haithammubarak/messaging-platform:messaging-service}"

echo "Preparing to push local image: ${LOCAL_IMAGE} -> ${DEST}"

# Check if local image exists
if ! docker image inspect "${LOCAL_IMAGE}" > /dev/null 2>&1; then
  echo "Local image ${LOCAL_IMAGE} not found. Attempting to build from repo Dockerfile..."
  # Build context: repository root. Adjust path if running script from elsewhere.
  REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
  docker build -t "${LOCAL_IMAGE}" -f "${REPO_ROOT}/docker/messaging-service/Dockerfile" "${REPO_ROOT}" || { echo "Build failed"; exit 1; }
else
  echo "Found local image ${LOCAL_IMAGE}"
fi

echo "Tagging ${LOCAL_IMAGE} as ${DEST}..."
docker tag "${LOCAL_IMAGE}" "${DEST}"

echo "Pushing ${DEST}..."
docker push "${DEST}"

echo "Push completed successfully."
exit 0

