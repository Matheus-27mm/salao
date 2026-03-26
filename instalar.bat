@echo off
echo ============================================
echo  Sistema Salao de Beleza - Setup
echo ============================================
echo.

echo [1/4] Instalando dependencias do backend...
cd backend
npm install
if errorlevel 1 (echo ERRO ao instalar backend && pause && exit /b)

echo.
echo [2/4] Gerando cliente Prisma...
npx prisma generate
if errorlevel 1 (echo ERRO no Prisma && pause && exit /b)

echo.
echo [3/4] Instalando dependencias do frontend...
cd ..\frontend
npm install
if errorlevel 1 (echo ERRO ao instalar frontend && pause && exit /b)

cd ..
echo.
echo ============================================
echo  Setup concluido!
echo ============================================
echo.
echo PROXIMO PASSO:
echo   1. Copie backend\.env.example para backend\.env
echo   2. Preencha DATABASE_URL com sua string do Supabase
echo   3. Execute: iniciar.bat
echo.
pause
