import Link from 'next/link';

import { MailFilled, PhoneFilled, WhatsAppOutlined } from '@ant-design/icons';
import { Button, Result } from 'antd';

import { company } from '@/constants';

const ForgotPasswordSuccess = () => (
  <Result
    status="info"
    title="İsteğiniz Alındı"
    subTitle="Girdiğiniz mail adresine kayıtlı bir hesap mevcut ise parola sıfırlama yönergeleri gönderilecektir. Eğer birkaç dakika içerisinde mail ulaşmadıysa hızlıca yardım alabilmeniz için aşağı butonlar bıraktık."
    extra={[
      <Link href="/kullanici/giris">
        <Button type="primary" key="console">
          Geri Dön
        </Button>
      </Link>,
      <a href={company.phoneLink}>
        <Button>
          <PhoneFilled />
          Bizi Arayın
        </Button>
      </a>,
      <a href={company.emailLink}>
        <Button>
          <MailFilled />
          Mail Gönderin
        </Button>
      </a>,
      <a href={company.whatsappLink}>
        <Button>
          <WhatsAppOutlined />
          Whatsapp
        </Button>
      </a>,
    ]}
  />
);

export default ForgotPasswordSuccess;
