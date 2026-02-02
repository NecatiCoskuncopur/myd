'use client';

import { ReactNode } from 'react';

import StyledComponentsRegistry from '@/lib/StyledComponentsRegistry';
import { GlobalStyles } from '@/styles';

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <StyledComponentsRegistry>
      <GlobalStyles />
      {children}
    </StyledComponentsRegistry>
  );
};

export default Providers;
