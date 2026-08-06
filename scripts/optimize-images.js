/* eslint-disable no-console */
"use strict";

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const INPUT_DIR = path.join(process.cwd(), "images");
const OUTPUT_DIR = path.join(INPUT_DIR, "optimized");

const QUALITY = {
  avif: 50,
  webp: 76,
  jpeg: 78
};

const HERO_WIDTHS = [640, 960, 1280, 1600];
const SPOTLIGHT_WIDTHS = [640, 960, 1280];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function kb(filePath) {
  const size = fs.statSync(filePath).size / 1024;
  return `${size.toFixed(1)} KB`;
}

async function writeVariantSet({
  inputFile,
  outputBaseName,
  widths,
  aspectRatio,
  position = "centre",
  withJpegFallback = true
}) {
  const srcPath = path.join(INPUT_DIR, inputFile);

  if (!fs.existsSync(srcPath)) {
    throw new Error(`Missing source image: ${srcPath}`);
  }

  for (const width of widths) {
    const height = Math.round(width / aspectRatio);

    const basePipeline = sharp(srcPath)
      .rotate()
      .resize({
        width,
        height,
        fit: "cover",
        position,
        withoutEnlargement: true
      });

    const avifPath = path.join(OUTPUT_DIR, `${outputBaseName}-${width}.avif`);
    await basePipeline.clone().avif({ quality: QUALITY.avif }).toFile(avifPath);

    const webpPath = path.join(OUTPUT_DIR, `${outputBaseName}-${width}.webp`);
    await basePipeline.clone().webp({ quality: QUALITY.webp }).toFile(webpPath);

    if (withJpegFallback) {
      const jpgPath = path.join(OUTPUT_DIR, `${outputBaseName}-${width}.jpg`);
      await basePipeline
        .clone()
        .jpeg({ quality: QUALITY.jpeg, progressive: true, mozjpeg: true })
        .toFile(jpgPath);
    }
  }
}

async function writeOgBanner() {
  const srcPath = path.join(INPUT_DIR, "banner.jpg");

  if (!fs.existsSync(srcPath)) {
    throw new Error(`Missing source image: ${srcPath}`);
  }

  const width = 1200;
  const height = 630;

  const pipeline = sharp(srcPath)
    .rotate()
    .resize({
      width,
      height,
      fit: "cover",
      position: "centre",
      withoutEnlargement: true
    });

  const webpPath = path.join(OUTPUT_DIR, "banner-1200.webp");
  await pipeline.clone().webp({ quality: 82 }).toFile(webpPath);

  const jpgPath = path.join(OUTPUT_DIR, "banner-1200.jpg");
  await pipeline
    .clone()
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(jpgPath);
}

async function printOutputSummary() {
  const files = fs
    .readdirSync(OUTPUT_DIR)
    .filter((f) => /\.(avif|webp|jpg)$/i.test(f))
    .sort((a, b) => a.localeCompare(b));

  console.log("\nGenerated files:");
  for (const file of files) {
    const full = path.join(OUTPUT_DIR, file);
    console.log(`${file} - ${kb(full)}`);
  }
}

async function main() {
  ensureDir(OUTPUT_DIR);

  await writeVariantSet({
    inputFile: "smboro--jQc9HXteh4-unsplash.jpg",
    outputBaseName: "hero",
    widths: HERO_WIDTHS,
    aspectRatio: 16 / 9,
    position: "centre"
  });

  await writeVariantSet({
    inputFile: "drone liftoff.jpg",
    outputBaseName: "hero-flight",
    widths: HERO_WIDTHS,
    aspectRatio: 16 / 9,
    position: "centre"
  });

  await writeVariantSet({
    inputFile: "smboro--jQc9HXteh4-unsplash.jpg",
    outputBaseName: "spotlight-smboro",
    widths: SPOTLIGHT_WIDTHS,
    aspectRatio: 4 / 3,
    position: "centre"
  });

  await writeVariantSet({
    inputFile: "anthony-rosset-aidE5wrGwzQ-unsplash.jpg",
    outputBaseName: "spotlight-anthony",
    widths: SPOTLIGHT_WIDTHS,
    aspectRatio: 4 / 3,
    position: "centre"
  });

  await writeVariantSet({
    inputFile: "colin-lloyd-kx6VkhGxGdw-unsplash.jpg",
    outputBaseName: "spotlight-colin",
    widths: SPOTLIGHT_WIDTHS,
    aspectRatio: 4 / 3,
    position: "centre"
  });

  await writeOgBanner();
  await printOutputSummary();

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("\nImage optimization failed:");
  console.error(err);
  process.exit(1);
});
