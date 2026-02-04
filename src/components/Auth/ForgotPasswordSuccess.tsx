import Link from 'next/link';

import { MailFilled, PhoneFilled, WhatsAppOutlined } from '@ant-design/icons';
import { Button, Result, Space } from 'antd';

import { company } from '@/constants';

const ForgotPasswordSuccess = () => (
  <Result
    status="info"
    title="İsteğiniz Alındı"
    subTitle="Girdiğiniz mail adresine kayıtlı bir hesap mevcut ise parola sıfırlama yönergeleri gönderilecektir. Eğer birkaç dakika içerisinde mail ulaşmadıysa hızlıca yardım alabilmeniz için aşağı butonlar bıraktık."
    extra={
      <Space wrap>
        <Link href="/kullanici/giris">
          <Button type="primary">Geri Dön</Button>
        </Link>

        <a href={company.phoneLink}>
          <Button icon={<PhoneFilled />}>Bizi Arayın</Button>
        </a>

        <a href={company.emailLink}>
          <Button icon={<MailFilled />}>Mail Gönderin</Button>
        </a>

        <a href={company.whatsappLink}>
          <Button icon={<WhatsAppOutlined />}>Whatsapp</Button>
        </a>
      </Space>
    }
  />
);

export default ForgotPasswordSuccess;
