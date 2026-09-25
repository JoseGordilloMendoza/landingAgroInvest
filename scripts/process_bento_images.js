const sharp = require('sharp');
const path = require('path');

const imagesDir = path.join(__dirname, '..', 'assets', 'images');

const bentoFiles = [
  { name: 'bento_1_clean.png', src: 'bento_1_growth_1790358368506.jpg', type: 'dark', threshold: 24, full: 70 },
  { name: 'bento_2_clean.png', src: 'bento_2_decision_1790358404288.jpg', type: 'dark', threshold: 24, full: 70 },
  { name: 'bento_3_clean.png', src: 'bento_3_security_1790358463282.jpg', type: 'light', threshold: 28, full: 80 },
  { name: 'bento_4_clean.png', src: 'bento_4_opportunity_1790358518270.jpg', type: 'dark', threshold: 24, full: 70 },
  { name: 'bento_5_clean.png', src: 'bento_5_mindset_1790358528330.jpg', type: 'dark', threshold: 24, full: 70 },
  { name: 'bento_6_clean.png', src: 'bento_6_network_1790358560849.jpg', type: 'dark', threshold: 24, full: 70 },
];

async function processImage(item) {
  const inputPath = path.join(imagesDir, item.src);
  const outputPath = path.join(imagesDir, item.name);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(cx, cy);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const dist = Math.hypot(x - cx, y - cy);
      let radialFade = 1.0;
      const rRatio = dist / maxR;
      if (rRatio > 0.80) {
        radialFade = Math.max(0, 1.0 - (rRatio - 0.80) / 0.18);
      }

      if (item.type === 'dark') {
        const brightness = Math.max(r, g, b);
        let alpha = 0;
        if (brightness > item.threshold) {
          const t = Math.min(1, Math.max(0, (brightness - item.threshold) / (item.full - item.threshold)));
          const smooth = t * t * (3 - 2 * t);
          alpha = Math.round(255 * smooth);
        }
        alpha = Math.round(alpha * radialFade);
        data[idx + 3] = alpha;
      } else {
        const distFromWhite = Math.hypot(255 - r, 255 - g, 255 - b);
        let alpha = 0;
        if (distFromWhite > item.threshold) {
          const t = Math.min(1, Math.max(0, (distFromWhite - item.threshold) / (item.full - item.threshold)));
          const smooth = t * t * (3 - 2 * t);
          alpha = Math.round(255 * smooth);
        }
        alpha = Math.round(alpha * radialFade);
        data[idx + 3] = alpha;

        if (alpha > 0 && alpha < 255) {
          const a = alpha / 255;
          data[idx] = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - a)) / a)));
          data[idx + 1] = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - a)) / a)));
          data[idx + 2] = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - a)) / a)));
        }
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(`Processed: ${item.name}`);
}

async function run() {
  for (const item of bentoFiles) {
    await processImage(item);
  }
  console.log('All images updated with smooth alpha transparency!');
}

run().catch(console.error);
