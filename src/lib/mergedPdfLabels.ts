import PDFMerger from 'pdf-merger-js';

const mergePdfLabels = async (labels: string[]): Promise<Buffer> => {
  if (!labels.length) {
    return Buffer.alloc(0);
  }

  const merger = new PDFMerger();

  for (const label of labels) {
    const pdfBuffer = Buffer.from(label, 'base64');

    await merger.add(pdfBuffer, '1');
  }

  return merger.saveAsBuffer();
};

export default mergePdfLabels;
