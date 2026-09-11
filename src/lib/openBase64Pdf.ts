/**
 * Base64 formatındaki PDF verisini yeni bir tarayıcı sekmesinde açar.
 *
 * Base64 veri önce byte dizisine dönüştürülür, ardından PDF Blob oluşturularak
 * geçici bir Object URL üzerinden görüntülenir. Oluşturulan URL kısa süre sonra
 * bellekten temizlenir.
 *
 * @param base64 - Açılacak PDF dosyasının Base64 formatındaki içeriği
 */

const openBase64Pdf = (base64: string, targetWindow?: Window | null) => {
  const binary = atob(base64);

  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));

  const blob = new Blob([bytes], {
    type: 'application/pdf',
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

export default openBase64Pdf;
