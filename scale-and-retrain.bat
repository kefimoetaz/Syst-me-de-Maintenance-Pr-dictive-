@echo off
REM All-in-one script to scale machines and retrain ML model
REM This automates the entire process

echo ========================================
echo  MACHINE SCALING AND ML RETRAINING
echo ========================================
echo.

echo Step 1/4: Seeding diverse machines...
echo ----------------------------------------
cd backend
call node seed-diverse-machines.js
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Seeding failed!
    pause
    exit /b 1
)
echo.

echo Step 2/4: Verifying machine diversity...
echo ----------------------------------------
call node verify-machine-diversity.js
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Verification failed!
    pause
    exit /b 1
)
echo.

echo Step 3/4: Retraining ML model...
echo ----------------------------------------
cd ..\ml-service
call python -m src.training_pipeline
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Training failed!
    pause
    exit /b 1
)
echo.

echo Step 4/4: Running predictions...
echo ----------------------------------------
call python run_predictions_once.py
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Predictions failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo  SUCCESS! All steps completed.
echo ========================================
echo.
echo You now have:
echo   - 20 diverse machines
echo   - Retrained ML model (v8)
echo   - Fresh predictions with varied risk levels
echo.
echo Next: Check your dashboard at http://localhost:3001
echo.
pause
