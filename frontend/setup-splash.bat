@echo off
setlocal enabledelayedexpansion

:: Check if the app icon exists
if not exist "assets\app_icon.png" (
    echo Error: app_icon.png not found in assets directory
    exit /b 1
)

:: Create necessary directories
mkdir "android\app\src\main\res\drawable" 2>nul
mkdir "android\app\src\main\res\drawable-hdpi" 2>nul
mkdir "android\app\src\main\res\drawable-mdpi" 2>nul
mkdir "android\app\src\main\res\drawable-xhdpi" 2>nul
mkdir "android\app\src\main\res\drawable-xxhdpi" 2>nul
mkdir "android\app\src\main\res\drawable-xxxhdpi" 2>nul

:: Copy app icon to Android drawable folders
copy "assets\app_icon.png" "android\app\src\main\res\drawable-hdpi\splash_icon.png"
copy "assets\app_icon.png" "android\app\src\main\res\drawable-mdpi\splash_icon.png"
copy "assets\app_icon.png" "android\app\src\main\res\drawable-xhdpi\splash_icon.png"
copy "assets\app_icon.png" "android\app\src\main\res\drawable-xxhdpi\splash_icon.png"
copy "assets\app_icon.png" "android\app\src\main\res\drawable-xxxhdpi\splash_icon.png"

:: Generate Android splash screen drawable
(
echo ^<?xml version="1.0" encoding="utf-8"?^>
echo ^<layer-list xmlns:android="http://schemas.android.com/apk/res/android"^>
echo     ^<item android:drawable="@color/splash_background"/^>
echo     ^<item^>
echo         ^<bitmap
echo             android:gravity="center"
echo             android:src="@drawable/splash_icon"/^>
echo     ^</item^>
echo ^</layer-list^>
) > "android\app\src\main\res\drawable\splash_screen.xml"

:: Generate Android colors.xml
(
echo ^<?xml version="1.0" encoding="utf-8"?^>
echo ^<resources^>
echo     ^<color name="splash_background"^>#FFFFFF^</color^>
echo ^</resources^>
) > "android\app\src\main\res\values\colors.xml"

:: Update Android styles.xml
(
echo ^<resources^>
echo     ^<style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar"^>
echo         ^<item name="android:editTextBackground"^>@drawable/rn_edit_text_material^</item^>
echo         ^<item name="android:windowBackground"^>@drawable/splash_screen^</item^>
echo     ^</style^>
echo ^</resources^>
) > "android\app\src\main\res\values\styles.xml"

:: Create iOS directories (if needed)
mkdir "ios\AwesomeProject\Images.xcassets\SplashIcon.imageset" 2>nul

:: Copy app icon to iOS assets
copy "assets\app_icon.png" "ios\AwesomeProject\Images.xcassets\SplashIcon.imageset\splash_icon.png"

:: Create iOS image set JSON
(
echo {
echo   "images": [
echo     {
echo       "filename": "splash_icon.png",
echo       "idiom": "universal",
echo       "scale": "1x"
echo     }
echo   ],
echo   "info": {
echo     "author": "xcode",
echo     "version": 1
echo   }
echo }
) > "ios\AwesomeProject\Images.xcassets\SplashIcon.imageset\Contents.json"

:: Create iOS LaunchScreen.storyboard
(
echo ^<?xml version="1.0" encoding="UTF-8"?^>
echo ^<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="21701" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" launchScreen="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="01J-lp-oVM"^>
echo     ^<device id="retina4_7" orientation="portrait" appearance="light"/^>
echo     ^<dependencies^>
echo         ^<deployment identifier="iOS"/^>
echo         ^<plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="21701"/^>
echo         ^<capability name="Safe area layout guides" minToolsVersion="9.0"/^>
echo         ^<capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/^>
echo     ^</dependencies^>
echo     ^<scenes^>
echo         ^<scene sceneID="EHf-IW-A2E"^>
echo             ^<objects^>
echo                 ^<viewController id="01J-lp-oVM" sceneMemberID="viewController"^>
echo                     ^<view key="view" contentMode="scaleToFill" id="Ze5-6b-2t3"^>
echo                         ^<rect key="frame" x="0.0" y="0.0" width="375" height="667"/^>
echo                         ^<autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/^>
echo                         ^<subviews^>
echo                             ^<imageView clipsSubviews="YES" userInteractionEnabled="NO" contentMode="scaleAspectFit" horizontalHuggingPriority="251" verticalHuggingPriority="251" image="SplashIcon" translatesAutoresizingMaskIntoConstraints="NO" id="0E6-BI-UEP"^>
echo                                 ^<rect key="frame" x="87.5" y="233.5" width="200" height="200"/^>
echo                                 ^<constraints^>
echo                                     ^<constraint firstAttribute="width" constant="200" id="7Mm-Qk-Rlx"/^>
echo                                     ^<constraint firstAttribute="height" constant="200" id="lxT-yN-0q3"/^>
echo                                 ^</constraints^>
echo                             ^</imageView^>
echo                         ^</subviews^>
echo                         ^<viewLayoutGuide key="safeArea" id="Bcu-3y-fUS"/^>
echo                         ^<color key="backgroundColor" white="1" alpha="1" colorSpace="custom" customColorSpace="genericGamma22GrayColorSpace"/^>
echo                         ^<constraints^>
echo                             ^<constraint firstItem="0E6-BI-UEP" firstAttribute="centerY" secondItem="Ze5-6b-2t3" secondAttribute="centerY" id="2RA-JO-E3z"/^>
echo                             ^<constraint firstItem="0E6-BI-UEP" firstAttribute="centerX" secondItem="Ze5-6b-2t3" secondAttribute="centerX" id="8Fm-Kt-hZx"/^>
echo                         ^</constraints^>
echo                     ^</view^>
echo                 ^</viewController^>
echo                 ^<placeholder placeholderIdentifier="IBFirstResponder" id="iYj-Kq-Ea1" userLabel="First Responder" sceneMemberID="firstResponder"/^>
echo             ^</objects^>
echo             ^<point key="canvasLocation" x="52.173913043478265" y="375"/^>
echo         ^</scene^>
echo     ^</scenes^>
echo     ^<resources^>
echo         ^<image name="SplashIcon" width="200" height="200"/^>
echo     ^</resources^>
echo ^</document^>
) > "ios\AwesomeProject\LaunchScreen.storyboard"

echo Splash screen setup completed!
pause