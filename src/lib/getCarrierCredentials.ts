import { Carrier } from '@/constants';
import { carrierConfig } from '@/constants';

/**
 * Verilen taşıyıcıya ait kimlik doğrulama alanlarını döndürür.
 *
 * Taşıyıcı belirtilmemişse veya taşıyıcı için credential tanımı bulunmuyorsa
 * boş bir dizi döner. Dönen credential nesneleri yüzeysel olarak kopyalanır.
 *
 * @param carrier - Credential bilgileri alınacak taşıyıcı
 * @returns Taşıyıcıya ait credential alanları veya boş dizi
 */
const getCarrierCredentials = (carrier?: Carrier) => {
  if (!carrier) return [];

  return (
    carrierConfig[carrier]?.credentials.map(credential => ({
      ...credential,
    })) ?? []
  );
};

export default getCarrierCredentials;
