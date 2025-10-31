@echo off
rem Simple Windows CMD wrapper for SSH local port forwarding and optional remote interactive shell.
rem Usage: connect-windows.cmd [key_path] [ssh_user] [target] [-b] [-s]

:: default key path (adjust if needed)
set "KEY=%USERPROFILE%\.ssh\messaging_service_key"
if not "%~1"=="" set "KEY=%~1"

:: SSH connection settings (host and port published by docker)
set "HOST=161.97.129.173"
rem Default SSH port: gateway SSH (adminer no longer exposes SSH)
set "PORT=2222"
set "USER=root"
if not "%~2"=="" set "USER=%~2"

:: Target (adminer or gateway). Default gateway.
set "TARGET=gateway"
if not "%~3"=="" (
  if /I "%~3"=="gateway" set "TARGET=gateway"
  if /I "%~3"=="adminer" set "TARGET=adminer"
)

:: background flag (default: foreground)
set "BACKGROUND=0"
set "SHELL=1"
:: non-interactive batch flag (default 0 - allow passphrase prompt)
set "NONINTERACTIVE=0"

:: parse additional args (limited simple parsing). Accepts -b, -s, -B anywhere after the first 3 args.
:parse_args
if "%~4"=="" goto after_parse
if /I "%~4"=="-b" set "BACKGROUND=1" & goto parse_args_next
if /I "%~4"=="-s" set "SHELL=1" & goto parse_args_next
if /I "%~4"=="-B" set "NONINTERACTIVE=1" & goto parse_args_next
shift
goto parse_args

:parse_args_next
shift
goto parse_args

:after_parse

:: If target requires different published port, adjust it (only if user didn't explicitly pass a port)
if /I "%TARGET%"=="adminer" (
  if "%PORT%"=="2222" set "PORT=2222"
)

:: Port forwards (localhost:localport:target:targetport)
set "F1=127.0.0.1:5432:postgres:5432"
set "F2=127.0.0.1:6379:redis:6379"
set "F3=127.0.0.1:9092:kafka:9092"
rem Adminer web UI forward (host 127.0.0.1:8081 -> adminer:80)
set "F4=127.0.0.1:8081:adminer:80"
rem Disabled: binds local 127.0.0.1:8082 and conflicts with a locally running app
rem set "F4b=127.0.0.1:8082:localhost:8082"
set "F5=127.0.0.1:50051:messaging_service:5005"  :: JVM debug: local 50051 -> remote 5005 (localhost-only)

:: Non-interactive SSH options for Windows OpenSSH (no host prompt, strict batch mode, exit on forward failure)
set "SSH_OPTS=-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ExitOnForwardFailure=yes -o ServerAliveInterval=60 -o ServerAliveCountMax=3"

:: If NONINTERACTIVE set, add BatchMode to SSH options
if "%NONINTERACTIVE%"=="1" set "SSH_OPTS=%SSH_OPTS% -o BatchMode=yes"

:: Prepare mapping display helper
set "MAPS=Local 127.0.0.1:5432 -> postgres:5432^&Local 127.0.0.1:6379 -> redis:6379^&Local 127.0.0.1:9092 -> kafka:9092^&Local 127.0.0.1:8081 -> adminer:80^&Local 127.0.0.1:50051 -> 127.0.0.1:5005"

:: If shell requested AND background, start forwards first in background, then open an interactive ssh shell to the host.
if "%SHELL%"=="1" (
  if "%BACKGROUND%"=="1" (
    echo Starting port forwards in background...
    echo %MAPS:^&=
    ssh -i "%KEY%" %SSH_OPTS% -f -N -L %F1% -L %F2% -L %F3% -L %F4% -L %F5% -p %PORT% %USER%@%HOST%
    echo Opening interactive SSH shell to %USER%@%HOST%...
    ssh -i "%KEY%" %SSH_OPTS% -t -p %PORT% %USER%@%HOST%
    goto end
  ) else (
    echo Port mappings (will be opened):
    for %%M in ("%MAPS:^&%") do echo %%~M
    echo Starting SSH with forwards and opening remote shell...
    ssh -i "%KEY%" %SSH_OPTS% -t -p %PORT% -L %F1% -L %F2% -L %F3% -L %F4% -L %F5% %USER%@%HOST%
    goto end
  )
)

:: No shell requested: just start forwards (background or foreground)
echo Running SSH with key %KEY% user %USER% host %HOST% port %PORT%
echo Port mappings (forwards to be opened):
echo %MAPS:^
if "%BACKGROUND%"=="1" (
  ssh -i "%KEY%" %SSH_OPTS% -f -N -L %F1% -L %F2% -L %F3% -L %F4% -L %F5% -p %PORT% %USER%@%HOST%
) else (
  ssh -i "%KEY%" %SSH_OPTS% -N -L %F1% -L %F2% -L %F3% -L %F4% -L %F5% -p %PORT% %USER%@%HOST%
)

:end
exit /b 0

:usage
echo Usage: %~nx0 [path_to_private_key] [ssh_user] [target(adminer|gateway)] [-b] [-s]
exit /b 1
