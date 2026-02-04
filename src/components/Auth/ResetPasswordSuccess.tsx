import Link from 'next/link';

import { Button, Result } from 'antd';

const ResetPasswordSuccess = () => (
  <Result
    status="success"
    title="Başarıyla Sıfırlandı"
    subTitle="Parolanız başarıyla güncellendi, giriş yapabilirsiniz"
    extra={
      <Link href="/kullanici/giris">
        <Button type="primary">Giriş Yap</Button>
      </Link>
    }
  />
);

export default ResetPasswordSuccess;
