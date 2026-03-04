import { messages } from '@/constants';

const { CARRIER } = messages;

/**
 * UPS API üzerinden gönderi oluşturur ve etiket (label) ile tracking number üretir.
 *
 * İşleyiş:
 * - UPS OAuth endpoint'inden access token alınır
 * - Shipment endpoint'ine gönderi bilgileri ile istek atılır
 * - Başarılı yanıt sonrası tracking number ve PDF formatındaki
 *   label (base64 encoded) döndürülür
 *
 * @param shippingInstance - Gönderi bilgileri (gönderen, alıcı, paket vb.)
 * @param accountNumber - UPS gönderici hesap numarası
 * @param credentials - UPS API kimlik bilgileri (clientId, clientSecret)
 *
 * @returns
 * - trackingNumber: UPS tarafından üretilen takip numarası
 * - label: Base64 formatında PDF etiket verisi
 *
 * @throws
 * - UPS kimlik doğrulama başarısız olursa
 * - Gönderi oluşturma başarısız olursa
 * - Tracking number alınamazsa hata fırlatır
 */

const createUpsLabel = async ({
  shippingInstance,
  accountNumber,
  credentials,
}: ICreateUpsLabelParams): Promise<{
  trackingNumber: string;
  label: string;
}> => {
  const authRes = await fetch('https://onlinetools.ups.com/security/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!authRes.ok) {
    throw new Error(CARRIER.AUTH_FAILED);
  }

  const authData = await authRes.json();

  const accessToken = authData.access_token;

  const shipmentRes = await fetch('https://onlinetools.ups.com/api/shipments/v1/ship', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      ShipmentRequest: {
        Shipment: {
          Shipper: {
            Name: shippingInstance.shipper.name,
            ShipperNumber: accountNumber,
            Address: {
              AddressLine: [shippingInstance.shipper.address],
              City: shippingInstance.shipper.city,
              PostalCode: shippingInstance.shipper.postalCode,
              CountryCode: shippingInstance.shipper.countryCode,
            },
          },
          ShipTo: {
            Name: shippingInstance.recipient.name,
            Address: {
              AddressLine: [shippingInstance.recipient.address],
              City: shippingInstance.recipient.city,
              PostalCode: shippingInstance.recipient.postalCode,
              CountryCode: shippingInstance.recipient.countryCode,
            },
          },
          Package: {
            PackagingType: {
              Code: '02',
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: shippingInstance.package.unit,
              },
              Weight: shippingInstance.package.weight.toString(),
            },
          },
        },
        LabelSpecification: {
          LabelImageFormat: {
            Code: 'PDF',
          },
        },
      },
    }),
  });

  if (!shipmentRes.ok) {
    const err = await shipmentRes.text();
    throw new Error(`${CARRIER.SHIPMENT_FAILED}: ${err}`);
  }

  const shipmentData = await shipmentRes.json();

  const shipmentResponse = shipmentData?.ShipmentResponse?.ShipmentResults;

  const trackingNumber = shipmentResponse?.PackageResults?.TrackingNumber;

  const label = shipmentResponse?.PackageResults?.ShippingLabel?.GraphicImage;

  if (!trackingNumber) {
    throw new Error(CARRIER.TRACKING_NUMBER_NOT_FOUND);
  }

  return {
    trackingNumber,
    label,
  };
};

export default createUpsLabel;
