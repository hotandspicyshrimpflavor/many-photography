/**
 * Client-side image watermarking using HTML5 Canvas.
 * 
 * Watermarks are applied in the browser before upload, ensuring
 * the original unwatermarked image never leaves the client's device.
 * 
 * This complements server-side watermarking (Sharp) for defense-in-depth.
 */

interface ClientWatermarkOptions {
  text?: string;
  opacity?: number;
  fontSize?: number;
  position?: 'corner' | 'center' | 'tiled';
  corner?: 'br' | 'bl' | 'tr' | 'tl';
  fontFamily?: string;
  color?: string;
}

const DEFAULT_OPTIONS: Required<ClientWatermarkOptions> = {
  text: "© Many's Photography",
  opacity: 0.4,
  fontSize: 24,
  position: 'corner',
  corner: 'br',
  fontFamily: 'Arial, sans-serif',
  color: 'rgba(255, 255, 255, 0.4)',
};

/**
 * Load an image from a URL or File and return an HTMLImageElement
 */
function loadImage(src: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = typeof src === 'string' ? src : URL.createObjectURL(src);
  });
}

/**
 * Get text dimensions for the watermark
 */
function measureText(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontSize: number,
  fontFamily: string
): { width: number; height: number } {
  ctx.font = `${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text);
  return {
    width: metrics.width,
    height: fontSize,
  };
}

/**
 * Draw a corner watermark
 */
function drawCornerWatermark(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  text: string,
  fontSize: number,
  fontFamily: string,
  color: string,
  corner: string,
  padding: number
) {
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'bottom';

  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize;

  let x: number;
  let y: number;
  let textAnchor: CanvasTextAlign;

  switch (corner) {
    case 'bl':
      x = padding;
      y = canvasHeight - padding;
      textAnchor = 'left';
      break;
    case 'tr':
      x = canvasWidth - padding;
      y = padding + textHeight;
      textAnchor = 'right';
      break;
    case 'tl':
      x = padding;
      y = padding + textHeight;
      textAnchor = 'left';
      break;
    case 'br':
    default:
      x = canvasWidth - padding;
      y = canvasHeight - padding;
      textAnchor = 'right';
      break;
  }

  // Draw shadow for readability
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ctx.textAlign = textAnchor;
  ctx.fillText(text, x, y);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/**
 * Draw a centered watermark
 */
function drawCenterWatermark(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  text: string,
  fontSize: number,
  fontFamily: string,
  color: string
) {
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/**
 * Draw a tiled watermark pattern across the image
 */
function drawTiledWatermark(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  text: string,
  fontSize: number,
  fontFamily: string,
  color: string
) {
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const tileWidth = fontSize * 12;
  const tileHeight = fontSize * 6;

  ctx.save();
  ctx.globalAlpha = parseFloat(color.replace(/[^0-9.]/g, '').slice(0, 4)) || 0.4;
  
  for (let y = -tileHeight; y < canvasHeight + tileHeight; y += tileHeight) {
    for (let x = -tileWidth / 2; x < canvasWidth + tileWidth; x += tileWidth) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 6); // -30 degree angle
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  }
  
  ctx.restore();
}

/**
 * Apply a visible watermark to an image in the browser.
 * Returns a Blob of the watermarked image (JPEG).
 * 
 * @param imageSrc - URL string or File object of the source image
 * @param options - Watermark configuration options
 * @returns Promise<Blob> - The watermarked image as a JPEG Blob
 */
export async function applyClientWatermark(
  imageSrc: string | File,
  options: ClientWatermarkOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const img = await loadImage(imageSrc);

  // Create canvas matching image dimensions
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas 2D context');
  }

  // Draw original image
  ctx.drawImage(img, 0, 0);

  // Calculate responsive font size based on image dimensions
  const minDimension = Math.min(canvas.width, canvas.height);
  const fontSize = Math.max(16, Math.min(minDimension / 15, opts.fontSize));

  // Build color with opacity
  const opacity = Math.min(1, Math.max(0, opts.opacity ?? 0.4));
  const baseColor = opts.color?.replace(/rgba?\([^)]+\)/, '') || 'rgba(255, 255, 255, ';
  const fullColor = opts.color?.startsWith('rgba')
    ? opts.color
    : `rgba(255, 255, 255, ${opacity})`;

  const padding = fontSize * 1.5;

  // Draw watermark based on position
  switch (opts.position) {
    case 'center':
      drawCenterWatermark(
        ctx, canvas.width, canvas.height,
        opts.text, fontSize * 1.5, opts.fontFamily, fullColor
      );
      break;
    case 'tiled':
      drawTiledWatermark(
        ctx, canvas.width, canvas.height,
        opts.text, fontSize, opts.fontFamily, fullColor
      );
      break;
    case 'corner':
    default:
      drawCornerWatermark(
        ctx, canvas.width, canvas.height,
        opts.text, fontSize, opts.fontFamily, fullColor,
        opts.corner ?? 'br', padding
      );
      break;
  }

  // Convert to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create watermarked image blob'));
        }
      },
      'image/jpeg',
      0.92
    );
  });
}

/**
 * Apply watermark and convert a File to a watermarked Blob.
 * Convenience wrapper for drag-and-drop or file input scenarios.
 */
export async function watermarkFile(
  file: File,
  options: ClientWatermarkOptions = {}
): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }
  return applyClientWatermark(file, options);
}

/**
 * Create a data URL of the watermarked image (for preview purposes).
 * Useful for showing the client a preview before upload.
 */
export async function createWatermarkPreview(
  imageSrc: string | File,
  options: ClientWatermarkOptions = {}
): Promise<string> {
  const blob = await applyClientWatermark(imageSrc, options);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
