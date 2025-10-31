@echo off
REM prune_all_volumes.cmd
REM Danger: this script will delete ALL Docker volumes on the host. Use with extreme care.
REM Location: docker/scripts/prune_all_volumes.cmd

SETLOCAL ENABLEDELAYEDEXPANSION

echo ---------------------------------------------------------------------
echo WARNING: This will permanently delete ALL Docker volumes on this machine.
echo If you only want to remove volumes created by this compose file, run the project-specific command instead:
echo    docker compose -f ..\docker-compose.hub.yml down --volumes --remove-orphans
echo ---------------------------------------------------------------------

echo Are you sure you want to delete ALL Docker volumes on this host? [y/N]
set /p CONFIRM=
if /i not "%CONFIRM%"=="y" (
    echo Aborting.
    exit /b 0
)

echo Stopping and removing all containers (may be required to free volumes)...
docker stop $(docker ps -aq) 2>nul || docker stop -a 2>nul || echo "No running containers to stop"
docker rm -f $(docker ps -aq) 2>nul || docker rm -f -a 2>nul || echo "No containers to remove"
echo Removing all Docker volumes...
docker volume ls -q > "%TEMP%\docker_all_volumes.txt"
for /f "usebackq delims=" %%v in ("%TEMP%\docker_all_volumes.txt") do (
    echo Removing volume: %%v
    docker volume rm -f "%%v" 2>nul || echo Failed to remove %%v
)
del "%TEMP%\docker_all_volumes.txt" >nul 2>&1
echo Done.
ENDLOCAL

