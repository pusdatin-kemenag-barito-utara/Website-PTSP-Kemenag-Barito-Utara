@echo off
cd /d "%~dp0"
if exist mobile cd mobile
echo ===================================================
echo   Memperbarui Icon Launcher dan Asset Logo SI ATAK
echo ===================================================
powershell -ExecutionPolicy Bypass -File "%~dp0mobile\scripts\setup_icons.ps1"
pause
