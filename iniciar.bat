@echo off
echo ============================================
echo  Sistema Salao de Beleza - Iniciando...
echo ============================================
echo.

echo Iniciando Backend (porta 3001)...
start "Backend - Salao" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Iniciando Frontend (porta 5173)...
start "Frontend - Salao" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo  Abrindo navegador...
echo ============================================
start http://localhost:5173

echo.
echo Dois terminais foram abertos:
echo   - Backend rodando em http://localhost:3001
echo   - Frontend rodando em http://localhost:5173
echo.
echo Para parar: feche os dois terminais
pause
