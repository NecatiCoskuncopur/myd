import { messages } from '@/constants';

const { CARRIER } = messages;

/**
 * FedEx API üzerinden gönderi oluşturur ve etiket (label) ile tracking number üretir.
 *
 * İşleyiş:
 * - FedEx OAuth endpoint'inden access token alınır
 * - Shipment endpoint'ine gönderi bilgileri ile istek atılır
 * - Başarılı yanıt sonrası tracking number ve
 *   PDF formatındaki label (base64 encoded) döndürülür
 *
 * @param shippingInstance - Gönderi bilgileri (gönderen, alıcı, paket vb.)
 * @param accountNumber - FedEx gönderici hesap numarası
 * @param credentials - FedEx API kimlik bilgileri (apiKey, secretKey)
 *
 * @returns
 * - trackingNumber: FedEx tarafından üretilen takip numarası
 * - label: Base64 formatında PDF etiket verisi
 *
 * @throws
 * - Kimlik doğrulama başarısız olursa
 * - Gönderi oluşturma başarısız olursa
 * - Tracking number alınamazsa hata fırlatır
 */

const createFedexLabel = async ({
  shippingInstance,
  accountNumber,
  credentials,
}: ICreateFedexLabelParams): Promise<{
  trackingNumber: string;
  label: string;
}> => {
  const authRes = await fetch('https://apis.fedex.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: credentials.apiKey,
      client_secret: credentials.secretKey,
    }),
  });

  if (!authRes.ok) {
    throw new Error(CARRIER.AUTH_FAILED);
  }

  const authData = await authRes.json();
  const accessToken = authData.access_token;

  const shipmentRes = await fetch('https://apis.fedex.com/ship/v1/shipments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      labelResponseOptions: 'LABEL',
      requestedShipment: {
        shipper: {
          contact: {
            personName: shippingInstance.shipper.name,
          },
          address: {
            streetLines: [shippingInstance.shipper.address],
            city: shippingInstance.shipper.city,
            postalCode: shippingInstance.shipper.postalCode,
            countryCode: shippingInstance.shipper.countryCode,
          },
        },
        recipients: [
          {
            contact: {
              personName: shippingInstance.recipient.name,
            },
            address: {
              streetLines: [shippingInstance.recipient.address],
              city: shippingInstance.recipient.city,
              postalCode: shippingInstance.recipient.postalCode,
              countryCode: shippingInstance.recipient.countryCode,
            },
          },
        ],
        shippingChargesPayment: {
          paymentType: 'SENDER',
          payor: {
            responsibleParty: {
              accountNumber: {
                value: accountNumber,
              },
            },
          },
        },
        serviceType: 'FEDEX_INTERNATIONAL_PRIORITY',
        packagingType: 'YOUR_PACKAGING',
        pickupType: 'USE_SCHEDULED_PICKUP',
        requestedPackageLineItems: [
          {
            weight: {
              units: shippingInstance.package.unit,
              value: shippingInstance.package.weight,
            },
          },
        ],
        labelSpecification: {
          imageType: 'PDF',
          labelStockType: 'PAPER_4X6',
        },
      },
    }),
  });

  if (!shipmentRes.ok) {
    const err = await shipmentRes.text();
    throw new Error(`${CARRIER.SHIPMENT_FAILED}: ${err}`);
  }

  const shipmentData = await shipmentRes.json();

  const output = shipmentData?.output?.transactionShipments?.[0];

  const trackingNumber = output?.pieceResponses?.[0]?.trackingNumber;

  const label = output?.pieceResponses?.[0]?.packageDocuments?.[0]?.encodedLabel;

  if (!trackingNumber) {
    throw new Error(CARRIER.TRACKING_NUMBER_NOT_FOUND);
  }

  return {
    trackingNumber,
    label,
  };
};

export default createFedexLabel;
