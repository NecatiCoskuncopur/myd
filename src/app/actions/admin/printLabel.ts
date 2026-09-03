'use server';

import { Types } from 'mongoose';

import { generalMessages, printerMessages, shippingMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { ShippingDocument } from '@/models';

const { UNEXPECTED_ERROR } = generalMessages;
const { NOT_FOUND } = shippingMessages;
const { ENV_NOT_FOUND, PRINTERNOT_FOUND } = printerMessages;

const PRINTER_TIMEOUT_MS = 10_000;

const printLabel = async (shippingId: string): Promise<ResponseTypes.IActionResponse<null>> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);

    if (authError) {
      return authError;
    }

    if (!Types.ObjectId.isValid(shippingId)) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    await connectMongoDB();

    const shippingDocument = await ShippingDocument.findOne({
      shippingId,
    }).select('label');

    if (!shippingDocument?.label) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    const printerUrl = process.env.OFFICE_PRINTER_API_URL;
    const printerPassword = process.env.OFFICE_PRINTER_PASSWORD;

    if (!printerUrl || !printerPassword) {
      captureActionError('printLabel.config', new Error(ENV_NOT_FOUND), {
        extras: {
          hasPrinterUrl: Boolean(printerUrl),
          hasPrinterPassword: Boolean(printerPassword),
        },
      });

      return {
        status: 'ERROR',
        message: UNEXPECTED_ERROR,
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PRINTER_TIMEOUT_MS);

    let response: Response;

    try {
      response = await fetch(printerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/pdf',
          'x-secret': printerPassword,
        },
        body: new Uint8Array(shippingDocument.label),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      captureActionError('printLabel.printer', new Error(`Printer API returned HTTP ${response.status}`), {
        extras: {
          shippingId,
          status: response.status,
          statusText: response.statusText,
        },
      });

      return {
        status: 'ERROR',
        message: PRINTERNOT_FOUND,
      };
    }

    return {
      status: 'OK',
      data: null,
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('printLabel', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default printLabel;
