@echo off
chcp 65001 >nul
cd /d "%~dp0"
node node_modules\next\dist\bin\next dev
