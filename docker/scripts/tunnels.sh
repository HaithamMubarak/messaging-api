#!/usr/bin/env bash
set -euo pipefail

# Simple helper to open an SSH connection to the remote host and
# create local port forwards for Postgres, Redis, Kafka, Adminer and the app.
# By default this script opens a normal interactive shell on the remote host
# as well as setting up the local port forwards.
# Usage:
#   ./tunnels.sh [-k /path/to/private_key] [-u user] [-b] [-S] [-h host] [-p port] [-t target]
#   -b runs the connection in background (forwards in background, shell still opens)
#   -S disables opening a remote shell (only sets up port forwards)

KEY_DEFAULT="$HOME/.ssh/messaging_service_key"
KEY="$KEY_DEFAULT"
HOST="161.97.129.173" # hmdevonline.com/161.97.129.173
# Default SSH port: gateway SSH (adminer no longer exposes SSH)
PORT="2222"
USER="root"
# Default to foreground so the script does not background the ssh process
BACKGROUND=0
# Open an interactive shell on the remote host by default
REMOTE_SHELL=1
# Target service for SSH on the host: adminer or gateway
TARGET="gateway"
# Non-interactive (batch) mode: when 1, add BatchMode=yes to SSH options
NONINTERACTIVE=0

usage() {
  cat <<USAGE
Usage: $0 [-k key_path] [-u user] [-b] [-B] [-S] [-h host] [-p port] [-t target]
  -k key_path   Path to private key (default: $KEY_DEFAULT)
  -u user       SSH username to connect as (default: dev)
  -b            Run SSH forwards in background (uses -f -N)
  -B            Non-interactive (BatchMode=yes) - useful for automated/CI use
  -S            Disable opening a remote shell (by default the script opens one)
  -h host       SSH host to connect (default: $HOST)
  -p port       SSH port (default: $PORT)
  -t target     Target service on host (adminer|gateway) - chooses default port mapping (default: gateway)

Examples:
  # Default: open remote shell with port forwards (foreground, allows passphrase prompt):
  $0

  # Non-interactive (fail if passphrase required):
  $0 -B

  # Background forwards, then open remote shell interactively:
  $0 -b

  # Only setup forwards (no remote shell):
  $0 -S
USAGE
}

# getopts: options k:, u:, b, B, S, h:, p:, t:
while getopts ":k:u:bBSh:p:t:" opt; do
  case $opt in
    k) KEY="$OPTARG" ;;
    u) USER="$OPTARG" ;;
    b) BACKGROUND=1 ;;
    B) NONINTERACTIVE=1 ;;
    S) REMOTE_SHELL=0 ;;
    h) HOST="$OPTARG" ;;
    p) PORT="$OPTARG" ;;
    t) TARGET="$OPTARG" ;;
    :) echo "Option -$OPTARG requires an argument." >&2; usage; exit 1 ;;
    \?) echo "Invalid option: -$OPTARG" >&2; usage; exit 1 ;;
  esac
done

# If user explicitly passed -p the PORT will already be set; otherwise the TARGET default is used
# (we keep compatibility so -p overrides -t)
if [ "$TARGET" = "adminer" ] && [ "$PORT" = "2222" ]; then
  PORT="2222"
fi

if ! command -v ssh >/dev/null 2>&1; then
  echo "ssh command not found. Install OpenSSH client first." >&2
  exit 1
fi

if [[ ! -f "$KEY" ]]; then
  echo "Warning: private key '$KEY' not found. If you don't have key-based auth available the connection will fail non-interactively." >&2
fi

# Non-interactive SSH options
SSH_OPTIONS=(
  -o StrictHostKeyChecking=no
  -o UserKnownHostsFile=/dev/null
  -o ExitOnForwardFailure=yes
  -o ServerAliveInterval=60
  -o ServerAliveCountMax=3
)

# If NONINTERACTIVE requested, add BatchMode option
if [ "$NONINTERACTIVE" -eq 1 ]; then
  SSH_OPTIONS+=( -o BatchMode=yes )
fi

# Build ssh base args
SSH_BASE=( -i "$KEY" -p "$PORT" )
for opt in "${SSH_OPTIONS[@]}"; do
  SSH_BASE+=( "$opt" )
done

# Port forwards: left side is local host on your laptop, right side is target hostname
# as seen from inside the docker network / container (or the remote host).
FORWARDS=(
  "-L" "127.0.0.1:5432:postgres:5432"    # Postgres
  "-L" "127.0.0.1:6379:redis:6379"      # Redis
  "-L" "127.0.0.1:9092:kafka:9092"      # Kafka broker
  # Messaging service SSH is disabled by default; if you enable SSH on the messaging-service host
  # you can forward application ports similarly. The app port forward is left commented out.
  # "-L" "127.0.0.1:8082:localhost:8082"  # Messaging app inside container (enable only if needed)
  "-L" "127.0.0.1:50051:messaging_service:5005"   # JVM debug: local 50051 -> remote 5005 (localhost-only)
)

# Forward Adminer UI through the gateway (gateway can reach adminer by service name)
FORWARDS+=( "-L" "127.0.0.1:8081:adminer:80" )

# Helper: build readable mapping lines from FORWARDS
readable_mappings=()
for ((i=0;i<${#FORWARDS[@]};i+=2)); do
  spec="${FORWARDS[i+1]}"
  IFS=':' read -r laddr lport rhost rport <<< "$spec"
  readable_mappings+=( "$laddr:$lport -> $rhost:$rport" )
done

# Behavior:
# - If REMOTE_SHELL=1 and BACKGROUND=0: run single ssh with forwards and open an interactive remote shell.
# - If REMOTE_SHELL=1 and BACKGROUND=1: start backgrounded ssh for forwards, then run a second interactive ssh to the host (so forwards remain in background).
# - If REMOTE_SHELL=0: only set up forwards (background or foreground depending on -b).

if (( REMOTE_SHELL == 1 && BACKGROUND == 1 )); then
  # 1) Start forwards in background
  ARGS_FORWARDS=( "${SSH_BASE[@]}" -f -N )
  for ((i=0;i<${#FORWARDS[@]};i+=2)); do
    ARGS_FORWARDS+=( "${FORWARDS[i]}" "${FORWARDS[i+1]}" )
  done
  ARGS_FORWARDS+=( "$USER@$HOST" )

  echo "Starting port forwards in background: ssh ${ARGS_FORWARDS[*]}"
  ssh "${ARGS_FORWARDS[@]}"

  # Print mapping info so user knows which local ports map where
  echo "Port mappings (forwards started in background):"
  for m in "${readable_mappings[@]}"; do
    echo "  $m"
  done

  # 2) Then open an interactive remote shell on the host
  echo "Opening interactive shell on remote host $USER@$HOST"
  ARGS_SHELL=( "${SSH_BASE[@]}" -t )
  # Open a normal interactive login shell on the remote host (no forced cd)
  ARGS_SHELL+=( "$USER@$HOST" )
  exec ssh "${ARGS_SHELL[@]}"

elif (( REMOTE_SHELL == 1 && BACKGROUND == 0 )); then
   # Single ssh invocation: forwards + interactive shell. No -N.
   ARGS=( "${SSH_BASE[@]}" )
   for ((i=0;i<${#FORWARDS[@]};i+=2)); do
     ARGS+=( "${FORWARDS[i]}" "${FORWARDS[i+1]}" )
   done
   # Open a normal interactive login shell on the remote host (no forced cd)
   ARGS+=( "$USER@$HOST" )

   echo "Port mappings (will be opened):"
   for m in "${readable_mappings[@]}"; do
     echo "  $m"
   done

   echo "Starting SSH with forwards and opening remote shell: ssh ${ARGS[*]}"
   exec ssh "${ARGS[@]}"

else
  # Forwards-only behavior. Use -N. Background mode uses -f -N.
  ARGS=( "${SSH_BASE[@]}" )
  if (( BACKGROUND == 1 )); then
    ARGS+=( -f -N )
  else
    ARGS+=( -N )
  fi
  for ((i=0;i<${#FORWARDS[@]};i+=2)); do
    ARGS+=( "${FORWARDS[i]}" "${FORWARDS[i+1]}" )
  done
  ARGS+=( "$USER@$HOST" )

  echo "Port mappings (forwards to be opened):"
  for m in "${readable_mappings[@]}"; do
    echo "  $m"
  done

  if (( BACKGROUND == 1 )); then
    echo "Running (forwards, background): ssh ${ARGS[*]}"
    exec ssh "${ARGS[@]}"
  else
    echo "Running (forwards, foreground): ssh ${ARGS[*]}"
    exec ssh "${ARGS[@]}"
  fi
fi
