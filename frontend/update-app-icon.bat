@echo off
setlocal enabledelayedexpansion

:: Check if the app icon exists
if not exist "assets\app_icon.png" (
    echo Error: app_icon.png not found in assets directory
    exit /b 1
)

:: Create necessary directories
mkdir "android\app\src\main\res\mipmap-hdpi" 2>nul
mkdir "android\app\src\main\res\mipmap-mdpi" 2>nul
mkdir "android\app\src\main\res\mipmap-xhdpi" 2>nul
mkdir "android\app\src\main\res\mipmap-xxhdpi" 2>nul
mkdir "android\app\src\main\res\mipmap-xxxhdpi" 2>nul

:: Copy app icon to Android mipmap folders for both round and regular icons
copy "assets\app_icon.png" "android\app\src\main\res\mipmap-hdpi\ic_launcher.png"
copy "assets\app_icon.png" "android\app\src\main\res\mipmap-hdpi\ic_launcher_round.png"

copy "assets\app_icon.png" "android\app\src\main\res\mipmap-mdpi\ic_launcher.png"
copy "assets\app_icon.png" "android\app\src\main\res\mipmap-mdpi\ic_launcher_round.png"

copy "assets\app_icon.png" "android\app\src\main\res\mipmap-xhdpi\ic_launcher.png"
copy "assets\app_icon.png" "android\app\src\main\res\mipmap-xhdpi\ic_launcher_round.png"

copy "assets\app_icon.png" "android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png"
copy "assets\app_icon.png" "android\app\src\main\res\mipmap-xxhdpi\ic_launcher_round.png"

copy "assets\app_icon.png" "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png"
copy "assets\app_icon.png" "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_round.png"

echo App icon updated successfully!
echo Please rebuild your app to see the changes.
pause