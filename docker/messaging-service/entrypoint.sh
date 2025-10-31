#!/bin/sh
set -e

# Default wait options (can be overridden via environment variables)
: ${DB_HOST:=postgres}
: ${DB_PORT:=5432}
: ${DB_WAIT_RETRIES:=30}
: ${DB_WAIT_SLEEP:=2}

# Kafka (always checked)
: ${KAFKA_HOST:=kafka}
: ${KAFKA_PORT:=9092}

echo "Starting entrypoint: waiting for secrets and service availability..."

# If a file exists at /run/secrets/postgres_password, read it and export as SPRING_DATASOURCE_PASSWORD
if [ -f /run/secrets/postgres_password ]; then
  # Strip CR and newline characters which can cause the Postgres SCRAM stringprep "Prohibited character" error
  passwd=$(tr -d '\r\n' < /run/secrets/postgres_password)
  if [ -n "$passwd" ]; then
    export SPRING_DATASOURCE_PASSWORD="$passwd"
    echo "Loaded database password from secret (trimmed)."
  else
    echo "Warning: postgres_password secret is empty after trimming; SPRING_DATASOURCE_PASSWORD not set." >&2
  fi
else
  echo "No docker secret found at /run/secrets/postgres_password - SPRING_DATASOURCE_PASSWORD must be provided via environment."
fi

# helper function: wait for host:port using nc
wait_for_host_port() {
  host="$1"
  port="$2"
  retries="$3"
  sleep_seconds="$4"

  if ! command -v nc > /dev/null 2>&1; then
    echo "netcat (nc) not available in container; cannot wait for ${host}:${port}."
    return 2
  fi

  echo "Waiting for ${host}:${port} (retries=${retries}, sleep=${sleep_seconds}s)"
  attempt=0
  while [ $attempt -lt "$retries" ]; do
    if nc -z -w 2 "$host" "$port" > /dev/null 2>&1; then
      echo "${host}:${port} is reachable"
      return 0
    fi
    attempt=$((attempt + 1))
    echo "${host}:${port} not reachable yet (attempt ${attempt}/${retries}), sleeping ${sleep_seconds}s..."
    sleep ${sleep_seconds}
  done

  echo "Timed out waiting for ${host}:${port} after ${retries} attempts." >&2
  return 1
}

# Unified helper to wait for a named service and print consistent messages
wait_service() {
  service_name="$1"
  host="$2"
  port="$3"
  retries="$4"
  sleep_seconds="$5"

  # call the lower-level wait; interpret return codes for messaging
  rc=0
  wait_for_host_port "$host" "$port" "$retries" "$sleep_seconds" || rc=$?

  if [ "$rc" -eq 0 ]; then
    echo "$service_name ready at ${host}:${port}"
    return 0
  elif [ "$rc" -eq 1 ]; then
    echo "Warning: $service_name did not become ready within timeout. Proceeding (may fail if $service_name is required)." >&2
    return 1
  else
    echo "netcat not available; skipping $service_name TCP readiness check (host: ${host}, port: ${port})."
    return 2
  fi
}

# Wait for Postgres
wait_service "Postgres" "$DB_HOST" "$DB_PORT" "$DB_WAIT_RETRIES" "$DB_WAIT_SLEEP"

# Wait for Kafka (demo mode: Redis removed)
wait_service "Kafka" "$KAFKA_HOST" "$KAFKA_PORT" "$DB_WAIT_RETRIES" "$DB_WAIT_SLEEP"

# Optionally start sshd if ENABLE_SSH is set to 1 and sshd is available
# Default is disabled to keep messaging-service images minimal and not expose SSH by default.
: ${ENABLE_SSH:=0}
if [ "$ENABLE_SSH" = "1" ]; then
  if command -v /usr/sbin/sshd > /dev/null 2>&1; then
    echo "ENABLE_SSH=1 - starting sshd..."
    /usr/sbin/sshd || true
  else
    echo "ENABLE_SSH=1 but sshd not found; skipping sshd start."
  fi
else
  echo "ENABLE_SSH not set or disabled; not starting sshd."
fi

# Launch the application (PID 1 should be the java process so container exits when app stops)
exec java $JAVA_OPTS -jar /app/app.jar
