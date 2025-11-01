@echo off
echo Building Pay Slip Pro APK Variants...
echo ======================================

cd /d "%~dp0frontend"

echo.
echo Building Universal APK (all architectures)...
echo ---------------------------------------------
call npx react-native run-android --variant=universalRelease
if %errorlevel% neq 0 (
    echo Universal APK build failed!
    pause
    exit /b 1
)

echo.
echo Building ARMv7 APK (armeabi-v7a)...
echo -----------------------------------
call npx react-native run-android --variant=armv7Release
if %errorlevel% neq 0 (
    echo ARMv7 APK build failed!
    pause
    exit /b 1
)

echo.
echo Building ARM64 APK (arm64-v8a)...
echo ---------------------------------
call npx react-native run-android --variant=arm64Release
if %errorlevel% neq 0 (
    echo ARM64 APK build failed!
    pause
    exit /b 1
)

echo.
echo Building x86 APK...
echo -------------------
call npx react-native run-android --variant=x86Release
if %errorlevel% neq 0 (
    echo x86 APK build failed!
    pause
    exit /b 1
)

echo.
echo Building x86_64 APK...
echo ----------------------
call npx react-native run-android --variant=x64Release
if %errorlevel% neq 0 (
    echo x86_64 APK build failed!
    pause
    exit /b 1
)

echo.
echo All APK variants built successfully!
echo ====================================
echo APK files are located in:
echo android/app/build/outputs/apk/
echo.
echo - universal-release.apk (contains all architectures)
echo - armv7/release/app-armv7-release.apk (ARMv7 32-bit)
echo - arm64/release/app-arm64-release.apk (ARM64 64-bit)
echo - x86/release/app-x86-release.apk (x86)
echo - x64/release/app-x64-release.apk (x86_64)
echo.
pause