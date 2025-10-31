@echo off
REM prune_compose_volumes.cmd
REM Remove only volumes referenced by a selected Docker Compose file in this repo.

SETLOCAL ENABLEDELAYEDEXPANSION

echo ---------------------------------------------------------------------
echo This script will run `docker compose -f <compose-file> down --volumes --remove-orphans`.
echo This removes the named volumes declared in that compose file and stops/removes the related containers.
echo It will NOT remove other global Docker volumes.
echo ---------------------------------------------------------------------

REM detect available compose files (relative to repo docker/scripts folder)
set COMPOSE1=..\docker-compose.hub.yml
set COMPOSE2=..\docker-compose.yml
set FOUND_COUNT=0
if exist "%~dp0%COMPOSE1%" (
  set /a FOUND_COUNT+=1
  set FILE1=%COMPOSE1%
)
if exist "%~dp0%COMPOSE2%" (
  set /a FOUND_COUNT+=1
  if not defined FILE1 set FILE1=%COMPOSE2% else set FILE2=%COMPOSE2%
)

if %FOUND_COUNT%==0 (
  echo No compose files found at '%~dp0\..'. Expected files: docker-compose.hub.yml or docker-compose.yml
  echo Edit this script if your compose files live somewhere else.
  exit /b 1
)

:choose
echo Found %FOUND_COUNT% compose file(s):
if defined FILE1 echo  [1] %FILE1%
if defined FILE2 echo  [2] %FILE2%
echo Choose the file number to operate on (default 1):
set /p CHOICE=
if "%CHOICE%"=="" set CHOICE=1
if "%CHOICE%"=="1" set TARGET=%FILE1%
if "%CHOICE%"=="2" set TARGET=%FILE2%
if not defined TARGET (
  echo Invalid choice. Try again.
  goto choose
)

echo Selected compose file: %TARGET%

echo Previewing the volumes section from the compose file:
type "%~dp0%TARGET%" | findstr /R /C:"^[ ]*volumes:" /C:"^[ ]*[a-zA-Z0-9_]*_data:" || echo "(Could not auto-detect named volumes; the compose down command will still remove declared volumes)"
echo ---------------------------------------------------------------------

echo This will run:
echo   docker compose -f "%~dp0%TARGET%" down --volumes --remove-orphans
echo ---------------------------------------------------------------------
echo Are you sure you want to proceed? [y/N]
set /p CONF=
if /i not "%CONF%"=="y" (
  echo Aborting.
  exit /b 0
)

echo Running docker compose down... This may take a while.
docker compose -f "%~dp0%TARGET%" down --volumes --remove-orphans
if %ERRORLEVEL% neq 0 (
  echo Command failed with exit code %ERRORLEVEL%.
  exit /b %ERRORLEVEL%
)
echo Done. Named volumes declared in %TARGET% have been removed (if present).
ENDLOCAL

