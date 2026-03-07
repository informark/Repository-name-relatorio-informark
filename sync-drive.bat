@echo off
cd /d "C:\Users\iNFORMARK Loja\Desktop\iphone-inteligencia\Bot"

powershell -ExecutionPolicy Bypass -File ".\auto-push.ps1"
powershell -ExecutionPolicy Bypass -File ".\sync-drive.ps1"