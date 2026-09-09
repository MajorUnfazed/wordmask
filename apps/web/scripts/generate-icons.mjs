// Rasterizes public/icon.svg into the PNG icons the PWA manifest and index.html
// reference. Re-run after changing the brand mark:  pnpm --filter web generate:icons
//
// The source SVG is a full-bleed #0a0a14 square with the mask centered well
// inside the maskable safe zone, so every target is a straight rasterize with
// no extra padding — the launcher can crop to a circle/squircle and the mark
// stays fully visible.
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const svg = await readFile(join(publicDir, 'icon.svg'))

// [output filename, edge size in px]. 192/512 are the manifest maskable icons;
// 180 is Apple's home-screen touch icon (referenced only from index.html).
const targets = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
]

for (const [name, size] of targets) {
  // density scales the SVG rasterization up before the resize so downscaled
  // sizes stay crisp rather than sampling a 512px render.
  await sharp(svg, { density: 512 })
    .resize(size, size)
    .png()
    .toFile(join(publicDir, name))
  console.log(`wrote ${name} (${size}x${size})`)
}
