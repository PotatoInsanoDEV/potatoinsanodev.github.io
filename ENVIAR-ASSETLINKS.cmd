@echo off
cd /d "%~dp0"
git add -A
git commit -m "assetlinks: SHA-256 da chave do Play"
git push
echo.
echo Se nao deu erro acima, ja foi publicado. Aguarde 1-2 minutos.
pause
