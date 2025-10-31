#!/bin/sh
set -e

# Minimal entrypoint that generates host keys and starts sshd if enabled
: ${ENABLE_SSH:=1}
: ${SSH_USER:=root}
: ${SSH_HOME:=/root}

echo "[gateway-entrypoint] STARTING entrypoint. ENABLE_SSH=$ENABLE_SSH SSH_USER=$SSH_USER SSH_HOME=$SSH_HOME"

# --- Check Docker secret for authorized_keys ---
if [ -f "/run/secrets/gateway_authorized_keys" ]; then
  echo "[gateway-entrypoint] Found Docker secret /run/secrets/gateway_authorized_keys (length: $(wc -c < /run/secrets/gateway_authorized_keys) bytes)"
  mkdir -p "$SSH_HOME/.ssh"
  cp /run/secrets/gateway_authorized_keys "$SSH_HOME/.ssh/authorized_keys"
  chmod 700 "$SSH_HOME/.ssh"
  chmod 600 "$SSH_HOME/.ssh/authorized_keys"
  chown -R root:root "$SSH_HOME/.ssh"
  dos2unix "$SSH_HOME/.ssh/authorized_keys" 2>/dev/null || true
  echo "[gateway-entrypoint] Installed authorized_keys to $SSH_HOME/.ssh/authorized_keys"
else
  echo "[gateway-entrypoint] No authorized_keys secret to install"
fi

# --- Generate host keys ---
if [ -x "$(command -v ssh-keygen)" ]; then
  echo "[gateway-entrypoint] Generating SSH host keys (if missing)..."
  ssh-keygen -A || true
fi

# --- Debug info ---
echo "[gateway-entrypoint] Stat authorized_keys and home dir permissions:"
stat -c '%A %u %g %n' "$SSH_HOME" || true
stat -c '%A %u %g %n' "$SSH_HOME/.ssh" || true
stat -c '%A %u %g %n' "$SSH_HOME/.ssh/authorized_keys" || true

# --- Start sshd in background ---
if [ "$ENABLE_SSH" = "1" ]; then
  if [ -x "$(command -v /usr/sbin/sshd)" ]; then
    echo "[gateway-entrypoint] ENABLE_SSH=1 - starting sshd in background..."
    /usr/sbin/sshd -D &
  else
    echo "[gateway-entrypoint] ENABLE_SSH=1 but sshd not found; skipping sshd start."
  fi
else
  echo "[gateway-entrypoint] ENABLE_SSH not enabled; not starting sshd."
fi

# --- Run main container command ---
if [ "$#" -gt 0 ]; then
  exec "$@"
else
  tail -f /dev/null  # keep container running if no command provided
fi
