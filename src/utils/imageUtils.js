import { encode } from '@jsquash/webp';

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se ha podido leer la imagen.'));
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se ha podido procesar la imagen.'));
    image.src = src;
  });

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se ha podido convertir la imagen a WebP.'));
    reader.readAsDataURL(blob);
  });

export async function optimizeImageForStorage(
  file,
  { maxDimension = 1600, quality = 75 } = {},
) {
  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);

  const ratio = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('No se ha podido preparar la imagen.');
  }

  canvas.width = width;
  canvas.height = height;

  context.drawImage(image, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);
  const webpBuffer = await encode(imageData, {
    quality,
  });

  const webpBlob = new Blob([webpBuffer], {
    type: 'image/webp',
  });

  return blobToDataUrl(webpBlob);
}