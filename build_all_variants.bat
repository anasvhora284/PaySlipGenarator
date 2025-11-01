@echo off
echo Building All Pay Slip Pro APK Variants using ABI Splits
echo =======================================================
cd /d "%~dp0frontend\android"

echo.
echo Building all APK variants (Universal + Architecture-specific)...
echo ----------------------------------------------------------------
call gradlew assembleRelease
if %errorlevel% neq 0 (
    echo Build failed!
    goto :error
)

echo.
echo ===============================================
echo All APK variants built successfully! ✓
echo ===============================================
echo.
echo APK files are located in: android/app/build/outputs/apk/release/
echo.
echo The following APKs have been generated:
echo - app-universal-release.apk (Universal - contains all architectures)
echo - app-armeabi-v7a-release.apk (ARMv7 32-bit)
echo - app-arm64-v8a-release.apk (ARM64 64-bit)
echo - app-x86-release.apk (Intel x86)
echo - app-x86_64-release.apk (Intel x86_64)
echo.
echo File sizes (approximate):
echo - Universal: ~25-35MB (largest, contains all architectures)
echo - ARMv7:     ~15-20MB (32-bit ARM devices)
echo - ARM64:     ~15-20MB (64-bit ARM devices - most modern Android)
echo - x86:       ~15-20MB (Intel x86 emulators)
echo - x86_64:    ~15-20MB (Intel x86_64 emulators)
echo.
goto :end

:error
echo.
echo Build process failed! Please check the errors above.
echo Common issues:
echo - Ensure Android SDK and NDK are properly installed
echo - Check that local.properties points to correct Android SDK
echo - Try running: gradlew clean
echo.
pause
exit /b 1

:end
echo.
echo Distribution recommendations:
echo - Use Universal APK for maximum compatibility
echo - Use ARM64 APK for modern Android devices (recommended)
echo - Use ARMv7 APK for older Android devices
echo - Use x86/x86_64 APKs for Android emulators on Intel machines
echo.
pause