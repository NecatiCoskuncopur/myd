/**
 * Base64 formatındaki dosya verisini yeni bir tarayıcı sekmesinde açar.
 *
 * @param base64 - Açılacak dosyanın Base64 formatındaki içeriği
 * @param contentType - Dosyanın MIME tipi
 * @param targetWindow - Varsa dosyanın açılacağı mevcut pencere
 */

const openBase64File = (base64: string, contentType: string, targetWindow?: Window | null) => {
  const binary = atob(base64);

  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));

  const blob = new Blob([bytes], {
    type: contentType,
  });

  const url = URL.createObjectURL(blob);

  if (targetWindow) {
    targetWindow.location.href = url;
  } else {
    window.open(url, '_blank');
  }

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60_000);
};

export default openBase64File;
