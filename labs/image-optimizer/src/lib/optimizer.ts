import sharp from 'sharp';

export async function optimizer(origin: string, destination: string, size: number, quality = 85): Promise<sharp.Sharp> {
  const image = sharp(origin);
  const imageMeta = await image.metadata();

  size = Math.min(imageMeta.width ?? size, size);

  const imageResized = image.resize({
    width: size,
    height: size,
    fit: 'cover',
  });

  let imageFormatted = imageResized;

  if (imageMeta.format === 'png') {
    imageFormatted = imageFormatted.png({
      compressionLevel: 9,
      quality,
    });
  }
  else if (imageMeta.format === 'jpeg' || imageMeta.format === 'jpg') {
    imageFormatted = imageFormatted.jpeg({
      mozjpeg: true,
      quality,
    });
  }

  await imageFormatted.toFile(destination);

  return imageFormatted;
}
