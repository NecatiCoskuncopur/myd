import React from 'react';

import { Tooltip } from '@mui/material';

type Props = {
  message?: string;
  children: React.ReactElement;
};

const ErrorTooltip = ({ message, children }: Props) => {
  return (
    <Tooltip title={message || ''} open={!!message} placement="top-start" arrow>
      {children}
    </Tooltip>
  );
};

export default ErrorTooltip;
