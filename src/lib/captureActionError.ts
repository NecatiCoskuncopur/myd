import * as Sentry from '@sentry/nextjs';

const captureActionError = (action: string, error: Error): void => {
  Sentry.withScope(scope => {
    scope.setTag('action', action);
    scope.captureException(error);
  });
};

export default captureActionError;
