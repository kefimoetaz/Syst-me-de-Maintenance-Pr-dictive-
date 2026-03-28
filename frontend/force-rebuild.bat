@echo off
echo Forcing complete rebuild...
rmdir /s /q dist 2>nul
rmdir /s /q node_modules\.vite 2>nul
echo Cache cleared!
echo.
echo Now restart the dev server with: npm run dev
pause
