@echo off
cd /d "%~dp0"
echo ===================================================
echo   Memperbarui Icon Launcher dan Asset Logo SI ATAK
echo ===================================================
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\setup_icons.ps1"
pause
