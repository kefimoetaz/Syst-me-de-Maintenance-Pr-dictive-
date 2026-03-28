@echo off
echo ========================================
echo ML Service Setup Script
echo ========================================
echo.

echo Creating virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Installing dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Creating models directory...
if not exist models mkdir models

echo.
echo Copying environment template...
if not exist .env (
    copy .env.example .env
    echo Created .env file - please edit with your settings
) else (
    echo .env file already exists - skipping
)

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file with your database credentials
echo 2. Run: venv\Scripts\activate
echo 3. Run: python -m src.app
echo.
pause
