'use client';

import { CacheProvider } from '@emotion/react';

import { muiCache } from '@/theme/emotion-cache';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <CacheProvider value={muiCache}>{children}</CacheProvider>;
};

export default Providers;
