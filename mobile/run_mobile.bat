@echo off
cd /d "%~dp0"
echo ===================================================
echo   Memulai Flutter PTSP Mobile Kemenag Barito Utara
echo ===================================================
if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" kill-server >nul 2>&1
    "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" start-server >nul 2>&1
)
flutter run --no-dds
pause
