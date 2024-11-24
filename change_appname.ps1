# Define old and new names
$oldAppName = "AwesomeProject"
$newAppName = "PaySlipPro"
$displayName = "Pay Slip Pro"
$oldPackageName = "com.awesomeproject"
$newPackageName = "com.payslippro"

# Function to update file content
function Update-FileContent {
    param (
        [string]$filePath,
        [string]$oldValue,
        [string]$newValue
    )
    if (Test-Path $filePath) {
        (Get-Content $filePath) -replace $oldValue, $newValue | Set-Content $filePath
        Write-Host "Updated $filePath"
    } else {
        Write-Host "File $filePath does not exist. Skipping update."
    }
}

# Update app.json
Update-FileContent "frontend/app.json" "`"name`": `"$oldAppName`"" "`"name`": `"$newAppName`""
Update-FileContent "frontend/app.json" "`"displayName`": `".*`"" "`"displayName`": `"$displayName`""

# Update package.json
Update-FileContent "frontend/package.json" "`"name`": `"$oldAppName`"" "`"name`": `"$newAppName`""

# Update Android build.gradle
Update-FileContent "frontend/android/app/build.gradle" $oldPackageName $newPackageName

# Update AndroidManifest.xml
Update-FileContent "frontend/android/app/src/main/AndroidManifest.xml" $oldPackageName $newPackageName

# Update strings.xml
Update-FileContent "frontend/android/app/src/main/res/values/strings.xml" $oldAppName $displayName

# Update iOS Info.plist
Update-FileContent "frontend/ios/$oldAppName/Info.plist" $oldAppName $displayName

# Rename iOS project directory
$iosOldPath = "frontend/ios/$oldAppName"
$iosNewPath = "frontend/ios/$newAppName"
if (Test-Path $iosOldPath) {
    Rename-Item $iosOldPath $iosNewPath
    Write-Host "Renamed iOS project directory to $newAppName"
} else {
    Write-Host "iOS project directory $iosOldPath does not exist. Skipping rename."
}

# Update iOS project.pbxproj
Update-FileContent "frontend/ios/$newAppName.xcodeproj/project.pbxproj" $oldAppName $newAppName

# Update Kotlin files
$kotlinFilePath = "frontend/android/app/src/main/java/com/$oldAppName/MainApplication.kt"
Update-FileContent $kotlinFilePath $oldPackageName $newPackageName

# Rename Kotlin package directory
$kotlinOldPath = "frontend/android/app/src/main/java/com/$oldAppName"
$kotlinNewPath = "frontend/android/app/src/main/java/com/$newAppName"
if (Test-Path $kotlinOldPath) {
    Rename-Item $kotlinOldPath $kotlinNewPath
    Write-Host "Renamed Kotlin package directory to $newAppName"
} else {
    Write-Host "Kotlin package directory $kotlinOldPath does not exist. Skipping rename."
}

Write-Host "App name and package updated to $displayName with package $newPackageName."