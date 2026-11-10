@echo off
cd /d "%~dp0"
git config user.name "DannD"
git config user.email "dannd@users.noreply.github.com"
git remote set-url origin https://github.com/PotatoInsanoDEV/potatoinsanodev.github.io.git
git add -A
git commit -m "assetlinks: SHA-256 da chave do Play"
git pull --rebase origin main
git push origin main
echo.
echo Se nao deu erro acima, ja foi publicado. Aguarde 1-2 minutos.
pause
