@echo off
echo === Installation des ameliorations du site Web ===

echo.
echo 1. Verification de l'environnement...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe. Veuillez l'installer depuis https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js est installe

echo.
echo 2. Installation des dependances...
call npm init -y
call npm install express dotenv stripe

echo.
echo 3. Creation des dossiers necessaires...
if not exist "js" mkdir js
if not exist "css" mkdir css

echo.
echo 4. Copie des fichiers...
copy /y nul js\premium-monetization.js >nul
copy /y nul js\ad-optimization.js >nul
copy /y nul js\advanced-analytics.js >nul
copy /y nul css\premium.css >nul

echo.
echo 5. Installation du script principal...
node install.js

echo.
echo === Installation terminee ===
echo Pour demarrer le serveur, executez : npm start
pause
