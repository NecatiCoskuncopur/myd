import Link from 'next/link';

import { Button, Result } from 'antd';

const SignUpSuccess = () => (
  <Result
    status="success"
    title="Kayıt İşlemi Başarılı!"
    subTitle="Artık MYD Export üyesisin, hemen Türkiyenin en avantajlı fiyatlarıyla gönderim yapmaya başla!"
    extra={
      <Link href="/kullanici/giris">
        <Button type="primary">Giriş Yap</Button>
      </Link>
    }
  />
);

export default SignUpSuccess;
