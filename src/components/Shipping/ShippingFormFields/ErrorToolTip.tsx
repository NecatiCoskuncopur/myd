import { Tooltip } from '@mui/material';
import type { ReactElement } from 'react';

type Props = {
  message?: string;
  children: ReactElement;
};

const ErrorTooltip = ({ message, children }: Props) => {
  return (
    <Tooltip title={message || ''} open={!!message} placement="top-start" arrow>
      {children}
    </Tooltip>
  );
};

export default ErrorTooltip;
