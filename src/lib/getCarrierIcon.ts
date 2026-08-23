import { Carrier, carrierConfig } from '@/constants';

/**
 * Verilen taşıyıcıya ait ikon bilgisini döndürür.
 *
 * Taşıyıcı için tanımlı bir ikon bulunamazsa `null` döner.
 *
 * @param carrier - İkonu alınacak taşıyıcı
 * @returns Taşıyıcıya ait ikon veya ikon bulunamazsa `null`
 */

const getCarrierIcon = (carrier: Carrier) => {
  return carrierConfig[carrier]?.icon ?? null;
};

export default getCarrierIcon;
