import * as Sentry from '@sentry/nextjs';

interface ICaptureActionErrorOptions {
  extras?: Record<string, unknown>;
  tags?: Record<string, string>;
}

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
