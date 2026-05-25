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
    reader.onerror = () => reject(new Error('No se ha podido convertir la imagen.'));
    reader.readAsDataURL(blob);
  });

const canvasToBlob = (canvas, mimeType, quality) =>
  new Promise((resolve, reject) => {
    if (!canvas.toBlob) {
      reject(new Error('Tu navegador no permite preparar esta imagen.'));
      return;
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('No se ha podido comprimir la imagen. Prueba con otra foto.'));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality,
    );
  });

const browserSupportsWebpCanvas = () => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
};

export async function optimizeImageForStorage(
  file,
  { maxDimension = 1600, quality = 75 } = {},
) {
  if (!file || !String(file.type || '').startsWith('image/')) {
    throw new Error('Selecciona una imagen valida.');
  }

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

  const outputMimeType = browserSupportsWebpCanvas() ? 'image/webp' : 'image/jpeg';
  const outputQuality = Math.min(1, Math.max(0.1, Number(quality) / 100));
  const optimizedBlob = await canvasToBlob(canvas, outputMimeType, outputQuality);

  return blobToDataUrl(optimizedBlob);
}
