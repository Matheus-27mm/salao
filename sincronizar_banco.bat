@echo off
echo ============================================
echo  Sincronizando banco de dados...
echo ============================================
cd /d %~dp0backend
npx prisma db push
echo.
echo Banco sincronizado com sucesso!
pause
