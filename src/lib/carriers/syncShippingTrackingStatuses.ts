import * as Sentry from '@sentry/nextjs';

import { ShippingStatus, TrackingStatusEnum } from '@/constants';
import normalizeCarrierTrackingStatus from '@/lib/carriers/normalizeCarrierTrackingStatus';
import trackCarrierShipping from '@/lib/carriers/trackCarrierShipping';
import connectMongoDB from '@/lib/db';
import { CarrierAccount, Shipping } from '@/models';

const BATCH_SIZE = 10;

const syncShippingTrackingStatuses = async () => {
  await connectMongoDB();

  const shippings = await Shipping.find({
    'carrier.trackingNumber': {
      $exists: true,
      $nin: [null, ''],
    },

    status: {
      $in: [ShippingStatus.LABELED, ShippingStatus.CANCELLED],
    },

    trackStatus: {
      $nin: [TrackingStatusEnum.DELIVERED, TrackingStatusEnum.RETURNED, TrackingStatusEnum.CANCELLED],
    },
  })
    .select('_id carrier trackStatus status')
    .lean();

  if (shippings.length === 0) {
    return {
      total: 0,
      updated: 0,
      failed: 0,
    };
  }

  const carrierAccounts = await CarrierAccount.find({}).select('carrier accountNumber credentials').lean();

  const accountMap = new Map(carrierAccounts.map(account => [`${account.carrier}:${account.accountNumber}`, account]));

  let updated = 0;
  let failed = 0;

  for (let index = 0; index < shippings.length; index += BATCH_SIZE) {
    const batch = shippings.slice(index, index + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async shipping => {
        const firm = shipping.carrier?.name;
        const trackingNumber = shipping.carrier?.trackingNumber;
        const accountNumber = shipping.carrier?.account;

        if (!firm || !trackingNumber || !accountNumber) {
          throw new Error(`Tracking bilgileri eksik. Shipping ID: ${shipping._id}`);
        }

        const carrierAccount = accountMap.get(`${firm}:${accountNumber}`);

        /*
         * FedEx tracking credential'ları env'den geliyor.
         * Bu yüzden FedEx için CarrierAccount bulunması zorunlu değil.
         *
         * UPS ve QuickShipper ise account credentials kullanıyor.
         */
        if (firm !== 'FEDEX' && !carrierAccount) {
          throw new Error(`Carrier account bulunamadı. Shipping ID: ${shipping._id}, Carrier: ${firm}`);
        }

        const rawStatus = await trackCarrierShipping({
          firm,
          accountNumber,
          trackingNumber,
          credentials: carrierAccount?.credentials ?? [],
        });

        /*
         * Örneğin yeni oluşturulmuş QuickShipper gönderisinde
         * henüz tracking history oluşmamış olabilir.
         *
         * Bu durumda mevcut trackStatus'u değiştirmiyoruz
         * ve işlemi hata olarak değerlendirmiyoruz.
         */
        if (!rawStatus) {
          return false;
        }

        const trackStatus = normalizeCarrierTrackingStatus(firm, rawStatus);

        const result = await Shipping.updateOne(
          {
            _id: shipping._id,

            status: {
              $in: [ShippingStatus.LABELED, ShippingStatus.CANCELLED],
            },

            trackStatus: {
              $nin: [TrackingStatusEnum.DELIVERED, TrackingStatusEnum.RETURNED, TrackingStatusEnum.CANCELLED],
            },
          },
          {
            $set: {
              trackStatus,
            },
          },
        );

        return result.modifiedCount > 0;
      }),
    );

    results.forEach((result, resultIndex) => {
      if (result.status === 'fulfilled') {
        if (result.value) {
          updated += 1;
        }

        return;
      }

      failed += 1;

      const shipping = batch[resultIndex];

      Sentry.captureException(result.reason, {
        extra: {
          operation: 'SYNC_SHIPPING_TRACKING',
          shippingId: shipping?._id?.toString(),
          trackingNumber: shipping?.carrier?.trackingNumber,
          carrier: shipping?.carrier?.name,
        },
      });
    });
  }

  return {
    total: shippings.length,
    updated,
    failed,
  };
};

export default syncShippingTrackingStatuses;
