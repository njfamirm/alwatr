import sharp from 'sharp';

import 'zx/globals';

export async function optimizer(
    origin: string,
    destination: string,
    width: number,
    height: number,
    quality?: number,
): Promise<sharp.Sharp> {
  const image = sharp(origin);
  const imageMeta = await image.metadata();

  width = Math.min(imageMeta.width ?? width, width);
  height = Math.min(imageMeta.width ?? height, height);

  const imageResized = image.resize({
    width,
    height,
    fit: 'cover',
  });

  let imageFormatted = imageResized;

  if (imageMeta.format === 'png') {
    imageFormatted = imageFormatted.png({
      compressionLevel: 9,
      quality: quality ?? 90,
    });
  }
  else if (imageMeta.format === 'jpeg' || imageMeta.format === 'jpg') {
    imageFormatted = imageFormatted.jpeg({
      mozjpeg: true,
      quality: quality ?? 70,
    });
  }

  if (origin === destination) {
    destination = destination
        .replaceAll('.jpg', '-i313o.jpg')
        .replaceAll('.jpeg', '-i313o.jpeg')
        .replaceAll('.png', '-i313o.png');

    await imageFormatted.toFile(destination);

    await fs.remove(origin);
    await fs.move(destination, origin);
  }
  else {
    await imageFormatted.toFile(destination);
  }

  return imageFormatted;
}
