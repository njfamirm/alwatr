import sharp from 'sharp';

import 'zx/globals';

export function ratio(x1: number, x2: number, y1: number): number {
  return Math.round((x1 * y1) / x2);
}

export async function optimizer(
    origin: string,
    destination: string,
    maxWidth: number,
    quality?: number,
): Promise<sharp.Sharp> {
  let image = sharp(origin);
  const imageMeta = await image.metadata();

  if (imageMeta.width != null && imageMeta.height != null) {
    const width = Math.min(imageMeta.width, maxWidth);
    const height = ratio(imageMeta.height, imageMeta.width, width);

    image = image.resize({
      width,
      height,
      fit: 'cover',
    });
  }

  if (imageMeta.format === 'png') {
    image = image.png({
      compressionLevel: 9,
      quality: quality ?? 90,
    });
  }
  else if (imageMeta.format === 'jpeg' || imageMeta.format === 'jpg') {
    image = image.jpeg({
      mozjpeg: true,
      quality: quality ?? 80,
    });
  }

  if (origin === destination) {
    destination = destination
        .replaceAll('.jpg', '-i313o.jpg')
        .replaceAll('.jpeg', '-i313o.jpeg')
        .replaceAll('.png', '-i313o.png');

    await image.toFile(destination);

    await fs.remove(origin);
    await fs.move(destination, origin);
  }
  else {
    await image.toFile(destination);
  }

  return image;
}
