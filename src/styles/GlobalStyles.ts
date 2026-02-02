'use client';

import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    padding: 0;
    margin: 0;
    list-style: none;
    border: none;
    text-decoration: none;
    box-sizing: border-box;
  }

  body {
    a {
      text-decoration: none;
      color: inherit;
    }
  }
`;

export default GlobalStyles;
