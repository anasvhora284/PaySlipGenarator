# Pay Slip Pro - APK Build Variants

This project supports building multiple APK variants for different Android architectures using ABI splits to optimize app size and compatibility.

## Available APK Variants

### 1. Universal APK
- **File**: `app-release.apk`
- **Architectures**: armeabi-v7a, arm64-v8a, x86, x86_64
- **Size**: ~25-35MB (largest)
- **Use case**: Maximum compatibility, works on all Android devices

### 2. ARMv7 APK (32-bit ARM)
- **File**: `app-armeabi-v7a-release.apk`
- **Architectures**: armeabi-v7a
- **Size**: ~15-20MB
- **Use case**: Older Android devices (pre-2015)

### 3. ARM64 APK (64-bit ARM)
- **File**: `app-arm64-v8a-release.apk`
- **Architectures**: arm64-v8a
- **Size**: ~15-20MB
- **Use case**: Modern Android devices (2015+), recommended for most users

### 4. x86 APK (Intel 32-bit)
- **File**: `app-x86-release.apk`
- **Architectures**: x86
- **Size**: ~15-20MB
- **Use case**: Android emulators on Intel machines

### 5. x86_64 APK (Intel 64-bit)
- **File**: `app-x86_64-release.apk`
- **Architectures**: x86_64
- **Size**: ~15-20MB
- **Use case**: Android emulators on modern Intel/AMD machines

## Build Scripts

### Quick Build Commands

1. **Build All Variants**: Run `build_all_variants.bat`
2. **Build Universal Only**: Run `build_universal.bat`
3. **Build ARMv7 Only**: Run `build_armv7.bat`
4. **Build ARM64 Only**: Run `build_arm64.bat`
5. **Build x86 Only**: Run `build_x86.bat`
6. **Build x86_64 Only**: Run `build_x64.bat`

### Manual Gradle Commands

From the `android` directory:

```bash
# Build all variants at once (Universal + Architecture-specific)
./gradlew assembleRelease

# Build debug variants
./gradlew assembleDebug
```

## Output Locations

All APK files are generated in: `android/app/build/outputs/apk/release/`

```
android/app/build/outputs/apk/release/
├── app-release.apk                    # Universal APK
├── app-armeabi-v7a-release.apk        # ARMv7 APK
├── app-arm64-v8a-release.apk          # ARM64 APK
├── app-x86-release.apk                # x86 APK
└── app-x86_64-release.apk             # x86_64 APK
```

## Distribution Recommendations

- **Google Play Store**: Upload Universal APK for broadest compatibility
- **Direct distribution**: Choose appropriate APK based on target device architecture
- **Development**: Use ARM64 for testing on modern devices
- **Emulator testing**: Use x86_64 for Intel-based emulators

## Architecture Support

| Architecture | Android Version | Device Types | Recommendation |
|-------------|----------------|--------------|----------------|
| armeabi-v7a | Android 4.0+ | Older ARM devices | Legacy support |
| arm64-v8a | Android 5.0+ | Modern ARM devices | Primary target |
| x86 | Android 4.0+ | Intel emulators | Development only |
| x86_64 | Android 5.0+ | Modern Intel emulators | Development only |

## Build Configuration

The build uses Android ABI splits to automatically generate separate APKs:

```gradle
splits {
    abi {
        enable true
        reset()
        include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
        universalApk true  // Also generates universal APK
    }
}
```

## Troubleshooting

### Build Fails
1. Ensure you have Android SDK and NDK installed
2. Check that `local.properties` points to correct Android SDK location
3. Clean build: `cd android && ./gradlew clean`

### APK Not Generated
1. Check build output for errors
2. Verify signing configuration in `build.gradle`
3. Ensure keystore files exist in `android/app/`

### Installation Issues
1. Enable "Unknown Sources" in Android settings
2. Check device architecture compatibility
3. Verify APK signature

## Notes

- All APKs are signed with the release keystore
- Debug variants are also available (replace `Release` with `Debug` in commands)
- Universal APK includes all architectures but is larger in size
- Architecture-specific APKs are smaller and optimized for specific devices
- ABI splits automatically handle the APK generation process