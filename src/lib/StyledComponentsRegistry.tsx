'use client';

import { ReactNode, useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';

import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

const StyledComponentsRegistry = ({ children }: { children: ReactNode }) => {
  const [sheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = sheet.getStyleElement();
    sheet.instance.clearTag();
    return <>{styles}</>;
  });

  return <StyleSheetManager sheet={sheet.instance}>{children}</StyleSheetManager>;
};

export default StyledComponentsRegistry;
