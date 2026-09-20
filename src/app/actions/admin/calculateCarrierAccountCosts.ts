'use server';

import { ValidationError } from 'yup';

import { addressMessages, Carrier, countries, generalMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { CarrierAccount } from '@/models';
import calculateCarrierAccountCostSchema from '@/schemas/calculateCarrierAccountCost.schema';
import { AdminTypes } from '@/types/admin';

const { UNEXPECTED_ERROR } = generalMessages;
const { COUNTRY } = addressMessages;

export const calculateCarrierAccountCosts = async (
  data: AdminTypes.ICalculateCarrierAccountCostsPayload,
): Promise<ResponseTypes.IActionResponse<AdminTypes.ICalculateCarrierAccountCostResponse[]>> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);

    if (authError) {
      return authError;
    }

    const validatedData = await calculateCarrierAccountCostSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const country = countries.find(item => item.code === validatedData.country);

    if (!country) {
      return {
        status: 'ERROR',
        message: COUNTRY.NOT_FOUND,
      };
    }

    await connectMongoDB();

    const zone = country.zone;

    const carrierAccounts = await CarrierAccount.find({
      isActive: true,
    })
      .select('_id name carrier pricing')
      .lean();

    const result: AdminTypes.ICalculateCarrierAccountCostResponse[] = [];

    for (const carrierAccount of carrierAccounts) {
      const pricingZone = carrierAccount.pricing?.zones?.find(item => item.number === zone);

      if (!pricingZone) {
        continue;
      }

      const prices = [...pricingZone.prices].sort((a, b) => a.weight - b.weight);

      if (!prices.length) {
        continue;
      }

      const matchedPrice = prices.find(item => item.weight >= validatedData.weight);

      let price: number;

      if (matchedPrice) {
        price = matchedPrice.price;
      } else {
        const lastPrice = prices.at(-1);

        if (!lastPrice) {
          continue;
        }

        const additionalWeight = validatedData.weight - lastPrice.weight;

        price = lastPrice.price + additionalWeight * pricingZone.than;
      }

      result.push({
        _id: carrierAccount._id.toString(),
        name: carrierAccount.name,
        carrier: carrierAccount.carrier as Carrier,
        zone,
        price,
      });
    }

    return {
      status: 'OK',
      data: result,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      captureActionError('calculateCarrierAccountCosts', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default calculateCarrierAccountCosts;
