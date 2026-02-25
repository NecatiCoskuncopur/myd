'use client';

import { useEffect, useRef } from 'react';

interface Props {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export default function HCaptchaField({ onVerify, onExpire }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const hcaptcha = window.hcaptcha;
      if (!hcaptcha || !containerRef.current) return;

      clearInterval(interval);

      if (widgetIdRef.current !== null) return;

      widgetIdRef.current = hcaptcha.render(containerRef.current, {
        sitekey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!,
        callback: onVerify,
        'expired-callback': onExpire,
      });
    }, 100);

    return () => {
      clearInterval(interval);

      const hcaptcha = window.hcaptcha;
      if (hcaptcha && widgetIdRef.current !== null) {
        hcaptcha.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} />;
}
