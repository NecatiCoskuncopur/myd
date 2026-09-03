import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const compressPdf = async (file: File): Promise<File> => {
  const arrayBuffer = await file.arrayBuffer();

  const pdfDocument = await pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  }).promise;

  let outputPdf: jsPDF | null = null;

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
    const page = await pdfDocument.getPage(pageNumber);

    const pageViewport = page.getViewport({
      scale: 1,
    });

    const renderViewport = page.getViewport({
      scale: 1.3,
    });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas oluşturulamadı.');
    }

    canvas.width = Math.floor(renderViewport.width);
    canvas.height = Math.floor(renderViewport.height);

    await page.render({
      canvas,
      canvasContext: context,
      viewport: renderViewport,
    }).promise;

    const imageData = canvas.toDataURL('image/jpeg', 0.55);

    const orientation = pageViewport.width > pageViewport.height ? 'landscape' : 'portrait';

    if (!outputPdf) {
      outputPdf = new jsPDF({
        orientation,
        unit: 'pt',
        format: [pageViewport.width, pageViewport.height],
        compress: true,
      });
    } else {
      outputPdf.addPage([pageViewport.width, pageViewport.height], orientation);
    }

    outputPdf.addImage(imageData, 'JPEG', 0, 0, pageViewport.width, pageViewport.height, undefined, 'FAST');
    canvas.width = 0;
    canvas.height = 0;
  }

  if (!outputPdf) {
    throw new Error('PDF oluşturulamadı.');
  }

  const blob = outputPdf.output('blob');

  return new File([blob], file.name, {
    type: 'application/pdf',
    lastModified: Date.now(),
  });
};

export default compressPdf;
