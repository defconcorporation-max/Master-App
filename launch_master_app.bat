@echo off
cd /d "%~dp0"
echo Starting Master App Dashboard...
echo.
echo The app is starting! 
echo.
echo Cleaning cache and starting...
if exist .next rd /s /q .next
start http://localhost:3000
cmd /c npm run dev
pause
