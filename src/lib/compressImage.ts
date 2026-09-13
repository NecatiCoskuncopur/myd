const compressImage = async (file: File): Promise<File> => {
  const image = await createImageBitmap(file);

  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / image.width);

  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas oluşturulamadı.');
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      result => {
        if (result) {
          resolve(result);
          return;
        }

        reject(new Error('Görsel sıkıştırılamadı.'));
      },
      'image/jpeg',
      0.8,
    );
  });

  const fileName = file.name.replace(/\.(png|jpe?g)$/i, '.jpg');

  return new File([blob], fileName, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
};

export default compressImage;
