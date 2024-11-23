const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
    mdpi: 200,
    hdpi: 300,
    xhdpi: 400,
    xxhdpi: 600,
    xxxhdpi: 800
};

async function generateImages() {
    const sourceIcon = path.join(__dirname, 'assets/app_icon.png');
    
    // Generate Android images
    for (const [density, size] of Object.entries(sizes)) {
        await sharp(sourceIcon)
            .resize(size, size)
            .toFile(path.join(__dirname, `android/app/src/main/res/drawable-${density}/splash_icon.png`));
    }
    
    // Generate iOS image
    await sharp(sourceIcon)
        .resize(200, 200)
        .toFile(path.join(__dirname, 'ios/AwesomeProject/Images.xcassets/SplashIcon.imageset/splash_icon.png'));
    
    // Create iOS image set JSON
    const iosImageSetJson = {
        "images": [
            {
                "filename": "splash_icon.png",
                "idiom": "universal",
                "scale": "1x"
            }
        ],
        "info": {
            "author": "xcode",
            "version": 1
        }
    };
    
    if (fs.existsSync('ios/AwesomeProject/Images.xcassets/SplashIcon.imageset')) {
        fs.mkdirSync('ios/AwesomeProject/Images.xcassets/SplashIcon.imageset', { recursive: true });
    }
    
    fs.writeFileSync(
        'ios/AwesomeProject/Images.xcassets/SplashIcon.imageset/Contents.json',
        JSON.stringify(iosImageSetJson, null, 2)
    );
}

generateImages().catch(console.error);
