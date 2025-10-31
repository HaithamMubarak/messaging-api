prune_all_volumes scripts

WARNING: Both scripts in this folder are destructive. They will permanently delete all Docker volumes on the host. Use with extreme care.

Files
- prune_all_volumes.cmd (Windows cmd.exe): interactive script that prompts before deleting all volumes.
- prune_all_volumes.sh (POSIX shell): interactive script that prompts for exact 'YES' confirmation.

Usage (Windows cmd.exe)
1. Open a cmd.exe as an administrator (if volumes are owned by another user).
2. From the repo root run:

   docker\scripts\prune_all_volumes.cmd

Usage (POSIX / Git Bash / WSL)
1. Make script executable (once):

   chmod +x docker/scripts/prune_all_volumes.sh

2. Run it from the repo root:

   ./docker/scripts/prune_all_volumes.sh

Added compose-specific scripts

Files
- prune_compose_volumes.cmd (Windows cmd.exe): interactive; chooses a compose file found in `docker/` and runs `docker compose -f <file> down --volumes --remove-orphans`.
- prune_compose_volumes.sh (POSIX shell): same but for POSIX environments.

Usage (recommended) - removes only volumes defined in the compose file

Windows (cmd.exe):

```
cd C:\Users\admin\dev\messaging-platform
docker\scripts\prune_compose_volumes.cmd
```

POSIX / Git Bash / WSL:

```
cd /c/Users/admin/dev/messaging-platform
chmod +x docker/scripts/prune_compose_volumes.sh
./docker/scripts/prune_compose_volumes.sh
```

Notes
- These scripts run `docker compose -f <compose-file> down --volumes --remove-orphans`, which removes volumes listed in the `volumes:` section of the specified compose file and stops/removes containers it defines.
- This is safer than deleting all volumes globally — it targets only volumes declared in that compose file.

Alternatives
- To only remove volumes defined by the compose file and containers in this compose project (recommended):

  docker compose -f docker/docker-compose.hub.yml down --volumes --remove-orphans

- To remove all unused volumes (non-forced):

  docker volume prune

Safety
- These scripts remove volumes globally and are irreversible.
- Back up databases and important files before running.
- If you only want to remove volumes for this project, use the compose-specific "down --volumes" command above.
- The operation is destructive for the compose project's volumes. Back up data first.
- If you have custom project names or use `-p/--project-name`, adapt the command accordingly.
