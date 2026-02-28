'use server';

import { messages } from '@/constants';
import requireRoles from '@/lib/requireRoles';
import { Storage } from '@/lib/storage';

const { GENERAL, PRINTER, SHIPPING } = messages;

const printLabel = async (shippingId: string): Promise<IActionResponse<null>> => {
  try {
    const authError = await requireRoles(['OPERATOR', 'ADMIN']);
    if (authError) return authError;

    if (!shippingId) {
      return {
        status: 'ERROR',
        message: SHIPPING.NOT_FOUND,
      };
    }

    const printerUrl = process.env.OFFICE_PRINTER_API_URL;
    const printerPassword = process.env.OFFICE_PRINTER_PASSWORD;

    if (!printerUrl || !printerPassword) {
      console.error('Printer environment variables missing');

      return {
        status: 'ERROR',
        message: GENERAL.UNEXPECTED_ERROR,
      };
    }

    let data: { Body: Buffer };

    try {
      data = await Storage.getObject({
        Bucket: 'labels',
        Key: `${shippingId}.pdf`,
      });
    } catch {
      return {
        status: 'ERROR',
        message: SHIPPING.NOT_FOUND,
      };
    }

    const base64Label = data.Body.toString('base64');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(printerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        password: printerPassword,
      },
      body: JSON.stringify({
        label: base64Label,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error('Printer responded with error:', response.status);

      return {
        status: 'ERROR',
        message: PRINTER.ERROR,
      };
    }

    return {
      status: 'OK',
      data: null,
    };
  } catch (error) {
    console.error('Print Label Error:', error);

    return {
      status: 'ERROR',
      message: GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default printLabel;
