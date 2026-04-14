import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

interface WatermarkOptions {
  watermarkText?: string;
  watermarkOpacity?: number;
  watermarkPosition?: 'corner' | 'center';
  corner?: 'br' | 'bl' | 'tr' | 'tl';
}

const DEFAULT_WATERMARK_TEXT = "© Many's Photography";
const DEFAULT_OPACITY = 0.4;
const DEFAULT_CORNER = 'br';

export async function applyWatermark(
  inputBuffer: Buffer,
  options: WatermarkOptions = {}
): Promise<Buffer> {
  const {
    watermarkText = DEFAULT_WATERMARK_TEXT,
    watermarkOpacity = DEFAULT_OPACITY,
    watermarkPosition = 'corner',
    corner = DEFAULT_CORNER,
  } = options;

  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Could not read image metadata');
  }

  // Create watermark SVG
  const fontSize = Math.max(14, Math.min(metadata.width, metadata.height) / 30);
  const padding = fontSize;

  const svgWatermark = `
    <svg width="${metadata.width}" height="${metadata.height}">
      <defs>
        <filter id="watermark-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
      </defs>
      <g opacity="${watermarkOpacity}">
        ${
          watermarkPosition === 'corner'
            ? getCornerWatermark(corner, metadata.width, metadata.height, fontSize, padding, watermarkText)
            : getCenterWatermark(metadata.width, metadata.height, fontSize, watermarkText)
        }
      </g>
    </svg>
  `;

  const watermarkBuffer = Buffer.from(svgWatermark);

  return await sharp(inputBuffer)
    .composite([
      {
        input: watermarkBuffer,
        top: 0,
        left: 0,
      },
    ])
    .toBuffer();
}

function getCornerWatermark(
  corner: string,
  width: number,
  height: number,
  fontSize: number,
  padding: number,
  text: string
): string {
  const positions: Record<string, { x: number; y: number; anchor: string }> = {
    br: { x: width - padding, y: height - padding, anchor: 'end' }, // bottom-right
    bl: { x: padding, y: height - padding, anchor: 'start' }, // bottom-left
    tr: { x: width - padding, y: padding + fontSize, anchor: 'end' }, // top-right
    tl: { x: padding, y: padding + fontSize, anchor: 'start' }, // top-left
  };

  const pos = positions[corner] || positions.br;

  return `
    <text
      x="${pos.x}"
      y="${pos.y}"
      font-family="Arial, sans-serif"
      font-size="${fontSize}px"
      font-weight="bold"
      fill="white"
      text-anchor="${pos.anchor}"
      dominant-baseline="auto"
      filter="url(#watermark-blur)"
    >${text}</text>
  `;
}

function getCenterWatermark(
  width: number,
  height: number,
  fontSize: number,
  text: string
): string {
  return `
    <text
      x="${width / 2}"
      y="${height / 2}"
      font-family="Arial, sans-serif"
      font-size="${fontSize * 1.5}px"
      font-weight="bold"
      fill="white"
      text-anchor="middle"
      dominant-baseline="middle"
      opacity="0.3"
    >${text}</text>
  `;
}

export async function createThumbnail(
  inputBuffer: Buffer,
  maxDimension: number = 300
): Promise<Buffer> {
  return await sharp(inputBuffer)
    .resize(maxDimension, maxDimension, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 60 })
    .toBuffer();
}

export async function createWebQuality(
  inputBuffer: Buffer,
  maxDimension: number = 2048
): Promise<Buffer> {
  return await sharp(inputBuffer)
    .resize(maxDimension, maxDimension, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toBuffer();
}

export async function createPrintQuality(
  inputBuffer: Buffer,
  options: WatermarkOptions = {}
): Promise<Buffer> {
  // Print quality: full resolution but still watermarked
  const watermarked = await applyWatermark(inputBuffer, {
    ...options,
    watermarkOpacity: 0.25, // Less visible for print
  });

  return await sharp(watermarked)
    .jpeg({ quality: 95 })
    .toBuffer();
}

export async function processImageFile(
  inputPath: string,
  outputDir: string,
  options: WatermarkOptions = {}
): Promise<{
  original: string;
  thumbnail: string;
  webQuality: string;
  printQuality: string;
}> {
  const inputBuffer = fs.readFileSync(inputPath);
  const filename = path.basename(inputPath, path.extname(inputPath));

  // Original (no watermark - stored securely)
  const originalPath = path.join(outputDir, `${filename}_original.jpg`);
  fs.writeFileSync(originalPath, inputBuffer);

  // Thumbnail
  const thumbnailBuffer = await createThumbnail(inputBuffer);
  const thumbnailPath = path.join(outputDir, `${filename}_thumb.jpg`);
  fs.writeFileSync(thumbnailPath, thumbnailBuffer);

  // Web quality (watermarked)
  const webBuffer = await applyWatermark(inputBuffer, {
    ...options,
    watermarkOpacity: 0.5,
    corner: 'br',
  });
  const webPath = path.join(outputDir, `${filename}_web.jpg`);
  fs.writeFileSync(webPath, webBuffer);

  // Print quality (watermarked but less visible)
  const printBuffer = await createPrintQuality(inputBuffer, options);
  const printPath = path.join(outputDir, `${filename}_print.jpg`);
  fs.writeFileSync(printPath, printBuffer);

  return {
    original: originalPath,
    thumbnail: thumbnailPath,
    webQuality: webPath,
    printQuality: printPath,
  };
}

export async function embedSteganographicWatermark(
  imageBuffer: Buffer,
  message: string
): Promise<Buffer> {
  // Simple LSB steganography - embed message in image pixels
  // This is a basic implementation - for production use a proper library

  const image = sharp(imageBuffer);
  const { data, info } = await image
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const messageWithTerminator = message + '\0'; // Null-terminated string
  const messageBytes = Buffer.from(messageWithTerminator, 'utf8');

  // Check if image is large enough to hold the message
  // Each pixel can store 1 bit in the alpha channel (LSB)
  const maxBits = info.width * info.height;
  const maxBytes = Math.floor(maxBits / 8);

  if (messageBytes.length > maxBytes) {
    throw new Error('Image too small to embed message');
  }

  // Embed length in first 32 bits (4 bytes)
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(messageBytes.length, 0);

  // Combine length + message
  const fullData = Buffer.concat([lengthBuffer, messageBytes]);

  // Embed in alpha channel LSB
  for (let i = 0; i < fullData.length; i++) {
    for (let bit = 0; bit < 8; bit++) {
      const pixelIndex = i * 8 + bit;
      const byteIndex = Math.floor(pixelIndex / 4);
      const bitIndex = pixelIndex % 4;
      const alphaIndex = byteIndex * 4 + 3; // RGBA = 4 bytes per pixel, alpha is 4th

      if (alphaIndex < data.length) {
        // Set alpha LSB to current bit of message
        const bitValue = (fullData[i] >> (7 - bit)) & 1;
        data[alphaIndex] = (data[alphaIndex] & 0xFE) | bitValue;
      }
    }
  }

  // Must use PNG to preserve the alpha channel where the watermark is embedded.
  // JPEG strips alpha and would destroy the hidden watermark.
  return await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

export async function extractSteganographicWatermark(imageBuffer: Buffer): Promise<string | null> {
  try {
    const image = sharp(imageBuffer);
    const { data, info } = await image
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });

    // Extract length from first 32 bits (4 bytes)
    let length = 0;
    for (let bit = 0; bit < 32; bit++) {
      const pixelIndex = bit;
      const byteIndex = Math.floor(pixelIndex / 4);
      const bitIndex = pixelIndex % 4;
      const alphaIndex = byteIndex * 4 + 3;

      if (alphaIndex < data.length) {
        const bitValue = data[alphaIndex] & 1;
        length = (length << 1) | bitValue;
      }
    }

    if (length <= 0 || length > 10000) {
      return null; // Invalid length
    }

    // Extract message
    const messageBytes = Buffer.alloc(length);
    for (let i = 0; i < length; i++) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit++) {
        const pixelIndex = (i + 4) * 8 + bit; // +4 to skip length bytes
        const byteIndex = Math.floor(pixelIndex / 4);
        const bitIndex = pixelIndex % 4;
        const alphaIndex = byteIndex * 4 + 3;

        if (alphaIndex < data.length) {
          const bitValue = data[alphaIndex] & 1;
          byte = (byte << 1) | bitValue;
        }
      }
      messageBytes[i] = byte;
    }

    const message = messageBytes.toString('utf8');
    const nullIndex = message.indexOf('\0');

    return nullIndex >= 0 ? message.substring(0, nullIndex) : message;
  } catch {
    return null;
  }
}
