const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const app = express();
const port = 3000;

// Configure storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public'));

const Cropper = require('cropperjs');

app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const topText = req.body.topText;
        const bottomText = req.body.bottomText;
        const croppedData = JSON.parse(req.body.croppedData);

        // Process the image
        const processedImage = await processImage(req.file.buffer, topText, bottomText, croppedData);

        res.type('image/png').send(processedImage);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing image.');
    }
});

async function processImage(imageBuffer, topText, bottomText, croppedData) {
    const sharp = require('sharp');

    // Parse cropping data and ensure valid numeric values
    let { left, top, width, height } = croppedData;

    left = parseFloat(left);
    top = parseFloat(top);
    width = parseFloat(width);
    height = parseFloat(height);

    if (isNaN(left) || isNaN(top)) {
        throw new Error('Invalid cropping data: left and top must be numeric values.');
    }

    // Round the dimensions to the nearest integer
    left = Math.round(left);
    top = Math.round(top);
    width = Math.round(width);
    height = Math.round(height);

    console.log(`Cropping data: left=${left}, top=${top}, width=${width}, height=${height}`);

    // Resize and crop the image based on adjusted cropping data
    const resizedImage = await sharp(imageBuffer)
        .resize({ width: width, height: height })
        .extract({ left: left, top: top, width: width, height: height })
        .toBuffer();

    // Overlay text on the resized and cropped image
    const compositeImage = await sharp(resizedImage)
        .composite([
            {
                input: Buffer.from(`<svg width="${width}" height="${height}">
                    <text x="${width / 2}" y="60" text-anchor="middle" fill="white" font-size="48" font-family="Impact" stroke="black" stroke-width="2">${topText}</text>
                    <text x="${width / 2}" y="${height - 30}" text-anchor="middle" fill="white" font-size="48" font-family="Impact" stroke="black" stroke-width="2">${bottomText}</text>
                </svg>`),
                gravity: 'center'
            }
        ])
        .png()
        .toBuffer();

    return compositeImage;
}


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
