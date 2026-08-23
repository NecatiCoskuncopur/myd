import { Carrier, carrierConfig } from '@/constants';

/**
 * Verilen taşıyıcı ve takip numarasına göre gönderi takip bağlantısını oluşturur.
 *
 * Taşıyıcı için bir takip URL'i tanımlıysa URL içerisindeki `%s` alanı
 * takip numarasıyla değiştirilir. Takip bağlantısı tanımlı değilse
 * `url: null` ve `hasLink: false` döner.
 *
 * @param carrier - Takip bağlantısı oluşturulacak taşıyıcı
 * @param trackingNo - Gönderiye ait takip numarası
 * @returns Takip URL'i ve bağlantının mevcut olup olmadığını belirten bilgi
 */
const getCarrierTrackingUrl = (carrier: Carrier, trackingNo: string) => {
  const url = carrierConfig[carrier]?.trackingUrl;

  if (!url) {
    return {
      url: null,
      hasLink: false,
    };
  }

  return {
    url: url.replace('%s', trackingNo),
    hasLink: true,
  };
};

export default getCarrierTrackingUrl;
