@echo off
echo ========================================
echo AGGRESSIVE CACHE CLEARING AND RESTART
echo ========================================
echo.

echo [1/5] Stopping any running dev servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Clearing Vite cache...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist .vite rmdir /s /q .vite

echo [3/5] Clearing dist folder...
if exist dist rmdir /s /q dist

echo [4/5] Clearing npm cache...
npm cache clean --force

echo [5/5] Starting fresh dev server...
echo.
echo ========================================
echo IMPORTANT: After server starts:
echo 1. Open browser in INCOGNITO/PRIVATE mode
echo 2. Or press Ctrl+Shift+Delete to clear browser cache
echo 3. Navigate to http://localhost:5173
echo ========================================
echo.

npm run dev
