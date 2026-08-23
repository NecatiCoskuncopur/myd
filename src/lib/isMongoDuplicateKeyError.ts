/**
 * Verilen hatanın MongoDB duplicate key hatası olup olmadığını kontrol eder.
 *
 * MongoDB'de unique index ihlallerinde dönen `11000` hata kodunu kontrol eder
 * ve sonuç doğruysa TypeScript için type guard görevi görür.
 *
 * @param error - Kontrol edilecek hata nesnesi
 * @returns Hata MongoDB duplicate key hatasıysa `true`, aksi halde `false`
 */

const isMongoDuplicateKeyError = (error: unknown): error is { code: number } => {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
};

export default isMongoDuplicateKeyError;
