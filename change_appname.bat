@echo off
setlocal enabledelayedexpansion

:: Define old and new names
set OLD_APP_NAME=AwesomeProject
set NEW_APP_NAME=Pay Slip Pro
set OLD_PACKAGE_NAME=com.awesomeproject
set NEW_PACKAGE_NAME=com.payslippro

:: Update app.json
echo Updating app.json...
powershell -Command "(Get-Content frontend\app.json) -replace '\"name\": \"!OLD_APP_NAME!\"', '\"name\": \"!NEW_APP_NAME!\"' | Set-Content frontend\app.json"

:: Update package.json
echo Updating package.json...
powershell -Command "(Get-Content frontend\package.json) -replace '\"name\": \"!OLD_APP_NAME!\"', '\"name\": \"!NEW_APP_NAME!\"' | Set-Content frontend\package.json"

:: Update Android build.gradle
echo Updating Android build.gradle...
powershell -Command "(Get-Content frontend\android\app\build.gradle) -replace '!OLD_PACKAGE_NAME!', '!NEW_PACKAGE_NAME!' | Set-Content frontend\android\app\build.gradle"

:: Update AndroidManifest.xml
echo Updating AndroidManifest.xml...
powershell -Command "(Get-Content frontend\android\app\src\main\AndroidManifest.xml) -replace '!OLD_PACKAGE_NAME!', '!NEW_PACKAGE_NAME!' | Set-Content frontend\android\app\src\main\AndroidManifest.xml"

:: Update strings.xml
echo Updating strings.xml...
powershell -Command "(Get-Content frontend\android\app\src\main\res\values\strings.xml) -replace '!OLD_APP_NAME!', '!NEW_APP_NAME!' | Set-Content frontend\android\app\src\main\res\values\strings.xml"

:: Update iOS Info.plist
echo Updating iOS Info.plist...
powershell -Command "(Get-Content frontend\ios\!OLD_APP_NAME!\Info.plist) -replace '!OLD_APP_NAME!', '!NEW_APP_NAME!' | Set-Content frontend\ios\!OLD_APP_NAME!\Info.plist"

:: Rename iOS project directory
echo Renaming iOS project directory...
ren frontend\ios\!OLD_APP_NAME! !NEW_APP_NAME!

:: Update iOS project.pbxproj
echo Updating iOS project.pbxproj...
powershell -Command "(Get-Content frontend\ios\!NEW_APP_NAME!.xcodeproj\project.pbxproj) -replace '!OLD_APP_NAME!', '!NEW_APP_NAME!' | Set-Content frontend\ios\!NEW_APP_NAME!.xcodeproj\project.pbxproj"

:: Update Kotlin files
echo Updating Kotlin files...
powershell -Command "(Get-Content frontend\android\app\src\main\java\com\!OLD_APP_NAME!\MainApplication.kt) -replace '!OLD_PACKAGE_NAME!', '!NEW_PACKAGE_NAME!' | Set-Content frontend\android\app\src\main\java\com\!OLD_APP_NAME!\MainApplication.kt"

:: Rename Kotlin package directory
echo Renaming Kotlin package directory...
ren frontend\android\app\src\main\java\com\!OLD_APP_NAME! !NEW_APP_NAME!

echo App name and package updated to !NEW_APP_NAME! with package !NEW_PACKAGE_NAME!.
pause