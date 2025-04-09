import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIcons() {
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  const inputPath = path.join(__dirname, 'client/public/favicon.svg');
  const outputDir = path.join(__dirname, 'client/public/icons');
  
  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Load SVG image
    const image = await loadImage(inputPath);
    
    // Generate icons of different sizes
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Draw image to canvas at desired size
      ctx.drawImage(image, 0, 0, size, size);
      
      // Save as PNG
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      
      console.log(`Created: ${outputPath}`);
    }
    
    // Generate apple-touch-icon
    const touchCanvas = createCanvas(180, 180);
    const touchCtx = touchCanvas.getContext('2d');
    touchCtx.drawImage(image, 0, 0, 180, 180);
    
    const appleTouchPath = path.join(__dirname, 'client/public/apple-touch-icon.png');
    const touchOut = fs.createWriteStream(appleTouchPath);
    const touchStream = touchCanvas.createPNGStream();
    touchStream.pipe(touchOut);
    
    console.log(`Created: ${appleTouchPath}`);
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();