import * as Sentry from '@sentry/nextjs';

interface ICaptureActionErrorOptions {
  extras?: Record<string, unknown>;
  tags?: Record<string, string>;
}

/**
 * Action veya yardımcı işlem sırasında oluşan hatayı Sentry'ye gönderir.
 *
 * Hata kaydına işlem adı `action` etiketi olarak eklenir.
 * İsteğe bağlı olarak ek tag ve debug bilgileri de gönderilebilir.
 *
 * @param action - Hatanın oluştuğu action veya işlem adı
 * @param error - Sentry'ye gönderilecek hata
 * @param options - Hata kaydına eklenecek opsiyonel bilgiler
 * @param options.tags - Sentry kaydına eklenecek ek etiketler
 * @param options.extras - Debug amacıyla eklenecek ek veriler
 */
const captureActionError = (action: string, error: unknown, options?: ICaptureActionErrorOptions): void => {
  Sentry.withScope(scope => {
    scope.setTag('action', action);

    if (options?.tags) {
      scope.setTags(options.tags);
    }

    if (options?.extras) {
      scope.setExtras(options.extras);
    }

    scope.captureException(error);
  });
};

export default captureActionError;
