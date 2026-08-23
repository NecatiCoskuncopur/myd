/**
 * Verilen veriyi JSON uyumlu sade bir nesneye dönüştürür.
 *
 * Mongoose dokümanları, ObjectId ve Date gibi JSON üzerinden
 * serileştirilebilen değerleri client tarafına gönderilebilir hale
 * getirmek için kullanılabilir.
 *
 * Not:
 * - `Date` değerleri string'e dönüşür.
 * - `ObjectId` değerleri string'e dönüşür.
 * - `undefined`, function ve Symbol gibi JSON tarafından desteklenmeyen
 *   değerler kaybolabilir.
 * - Dönüş tipi runtime'da doğrulanmaz; `T` yalnızca TypeScript type
 *   assertion olarak kullanılır.
 *
 * @template T Dönüşte beklenen veri tipi.
 * @param data Serileştirilecek veri.
 * @returns JSON uyumlu hale getirilmiş veri.
 */

const serialize = <T>(data: unknown): T => {
  return JSON.parse(JSON.stringify(data)) as T;
};

export default serialize;
