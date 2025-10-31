@echo off
REM Push local image "messaging-platform/messaging-service" to a remote repository/tag.
REM Usage:
REM   push_messaging_service.cmd [<local-image> [<dest-repo-tag>]]
REM Examples:
REM   push_messaging_service.cmd
REM   push_messaging_service.cmd my-image:latest haithammubarak/messaging-platform:messaging-service

nsetlocal
set "LOCAL_IMAGE=%~1"
if "%LOCAL_IMAGE%"=="" set "LOCAL_IMAGE=messaging-platform/messaging-service:latest"
set "DEST=%~2"
if "%DEST%"=="" set "DEST=haithammubarak/messaging-platform:messaging-service"

necho Preparing to push local image: %LOCAL_IMAGE% -> %DEST%

nREM Check if local image exists
docker image inspect %LOCAL_IMAGE% >nul 2>&1
if errorlevel 1 (
  echo Local image %LOCAL_IMAGE% not found. Attempting to build from repo.
  REM Try to build using the repository Dockerfile path. Adjust if your Dockerfile is elsewhere.
  docker build -t %LOCAL_IMAGE% -f docker/messaging-service/Dockerfile .. || goto :error
) else (
  echo Found local image %LOCAL_IMAGE%.
)

necho Tagging %LOCAL_IMAGE% as %DEST%...
docker tag %LOCAL_IMAGE% %DEST% || goto :error

necho Pushing %DEST%...
docker push %DEST% || goto :error

necho Push completed successfully.
endlocal
exit /b 0
:error
echo ERROR: push failed.
endlocal
exit /b 1

