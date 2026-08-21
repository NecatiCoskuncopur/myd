const openBase64Pdf = (base64: string) => {
  const binary = atob(base64);

  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));

  const blob = new Blob([bytes], {
    type: 'application/pdf',
  });

  const url = URL.createObjectURL(blob);

  window.open(url, '_blank', 'noopener,noreferrer');

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};

export default openBase64Pdf;
