'use client';

import { Turnstile } from '@marsidev/react-turnstile';

interface Props {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

const TurnstileCaptcha = ({ onVerify, onExpire }: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={onVerify}
        onExpire={onExpire}
        options={{
          theme: 'light',
        }}
      />
    </div>
  );
};

export default TurnstileCaptcha;
