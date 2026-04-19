/**
 * Cabinet Drawing Recolor Utility
 * 
 * Processes cabinet drawing PNG images to remap colors:
 *  - Black/dark grey lines → Gold (#C8A64E)
 *  - Blue lines (dashed internal components) → Black (#1a1a1a)
 *  - Red/pink fills (appliance areas) → Black (#1a1a1a)
 *  - White/light grey backgrounds remain unchanged
 */

// Gold color for structural lines
const GOLD = { r: 200, g: 166, b: 78 };
// Black for blue/red elements
const TARGET_BLACK = { r: 26, g: 26, b: 26 };

/**
 * Determine pixel category based on its RGB values
 */
function classifyPixel(r, g, b, a) {
  // Transparent or near-transparent — skip
  if (a < 30) return 'transparent';

  // White / very light background (r,g,b all > 230)
  if (r > 230 && g > 230 && b > 230) return 'background';

  // Light grey fill on cabinet faces (r,g,b between 180–230, low saturation)
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;

  if (r > 180 && g > 180 && b > 180 && saturation < 0.08) return 'light-grey';

  // Blue detection: b is dominant
  // Blue lines: typically b > 150, b > r * 1.5, b > g * 1.3
  if (b > 100 && b > r * 1.3 && b > g * 1.2) return 'blue';

  // Red/pink detection: r is dominant
  // Red/pink fills: r > 150, r > g * 1.4, r > b * 1.3
  if (r > 130 && r > g * 1.3 && r > b * 1.2) return 'red';

  // Black/dark grey lines: all channels low (< 100) and low saturation
  if (r < 120 && g < 120 && b < 120 && saturation < 0.2) return 'black-line';

  // Medium grey — could be shadow/fill on cabinet
  if (saturation < 0.1 && r > 120 && r < 200) return 'medium-grey';

  // Fallback: leave as is
  return 'other';
}

/**
 * Lerp between original color and target based on confidence
 */
function blendColor(origR, origG, origB, targetR, targetG, targetB, factor) {
  return {
    r: Math.round(origR + (targetR - origR) * factor),
    g: Math.round(origG + (targetG - origG) * factor),
    b: Math.round(origB + (targetB - origB) * factor),
  };
}

/**
 * Process an image element — replace its src with a recolored canvas data URL
 */
export function recolorCabinetImage(imgElement) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        const category = classifyPixel(r, g, b, a);

        switch (category) {
          case 'black-line': {
            // Black lines → gold, with intensity based on darkness
            const darkness = 1 - (r + g + b) / (3 * 255);
            const factor = Math.min(darkness * 1.5, 1);
            const blended = blendColor(r, g, b, GOLD.r, GOLD.g, GOLD.b, factor);
            data[i] = blended.r;
            data[i + 1] = blended.g;
            data[i + 2] = blended.b;
            break;
          }
          case 'blue': {
            // Blue → black
            const blueness = b / Math.max(1, (r + g) / 2);
            const factor = Math.min((blueness - 1) * 0.8, 1);
            const blended = blendColor(r, g, b, TARGET_BLACK.r, TARGET_BLACK.g, TARGET_BLACK.b, Math.max(0, factor));
            data[i] = blended.r;
            data[i + 1] = blended.g;
            data[i + 2] = blended.b;
            break;
          }
          case 'red': {
            // Red/pink → black  
            const redness = r / Math.max(1, (g + b) / 2);
            const factor = Math.min((redness - 1) * 0.7, 1);
            const blended = blendColor(r, g, b, TARGET_BLACK.r, TARGET_BLACK.g, TARGET_BLACK.b, Math.max(0, factor));
            data[i] = blended.r;
            data[i + 1] = blended.g;
            data[i + 2] = blended.b;
            break;
          }
          case 'medium-grey': {
            // Medium grey faces — give a very subtle warm gold tint
            const warmth = 0.15;
            data[i] = Math.min(255, Math.round(r + (GOLD.r - r) * warmth));
            data[i + 1] = Math.min(255, Math.round(g + (GOLD.g - g) * warmth));
            data[i + 2] = Math.min(255, Math.round(b + (GOLD.b - b) * warmth));
            break;
          }
          // 'background', 'light-grey', 'transparent', 'other' — leave as is
          default:
            break;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      imgElement.src = canvas.toDataURL('image/png');
      resolve();
    };

    img.onerror = () => {
      console.warn('Failed to load image for recoloring:', imgElement.src);
      resolve();
    };

    img.src = imgElement.src;
  });
}

/**
 * Batch-recolor all cabinet images on the page
 * Targets images within .product-image, .media-main, and .related-img containers
 */
export function recolorAllCabinetImages() {
  const selectors = [
    '.media-main img',
    '.product-image img',
    '.related-img img',
  ];

  const images = document.querySelectorAll(selectors.join(', '));
  const promises = Array.from(images).map(img => {
    if (img.complete && img.naturalWidth > 0) {
      return recolorCabinetImage(img);
    } else {
      return new Promise((resolve) => {
        img.addEventListener('load', () => recolorCabinetImage(img).then(resolve), { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    }
  });

  return Promise.all(promises);
}
