'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { LoadingOutlined, LockOutlined, MailOutlined, UnlockOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Row, Typography } from 'antd';

import signIn from '@/app/actions/auth/signIn';
import HCaptchaField from './HCaptcha';

interface SignInFormValues {
  email: string;
  password: string;
  captcha: string;
}

const SignInForm = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onFinish = (values: SignInFormValues) => {
    startTransition(async () => {
      try {
        await signIn({
          email: values.email,
          password: values.password,
          recaptchaToken: values.captcha,
        });

        router.push('/panel');
      } catch (error: unknown) {
        if (error instanceof Error) {
          message.error(error.message);
        } else {
          message.error('Giriş başarısız');
        }

        form.resetFields(['captcha']);
      }
    });
  };

  return (
    <Row style={{ height: '100%' }} align="middle" justify="center">
      <Col span={12}>
        <Row style={{ marginBottom: 20 }}>
          <img src="/images/logo.svg" width={150} alt="logo" />
        </Row>

        <Typography.Title level={3}>Giriş Yap</Typography.Title>

        <Typography.Text>
          Henüz kayıt olmadın mı? <Link href="/kullanici/kayit">Kayıt Ol</Link>
        </Typography.Text>

        <Form onFinish={onFinish} autoComplete="off" layout="vertical" form={form}>
          <Form.Item label="E-Posta" name="email" rules={[{ required: true }, { type: 'email' }]}>
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item label="Parola" name="password" rules={[{ required: true }, { min: 8 }]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item name="captcha" rules={[{ required: true, message: 'Lütfen doğrulamayı tamamlayın' }]} style={{ width: '100% ' }}>
            <HCaptchaField
              onVerify={token => {
                form.setFieldValue('captcha', token);
              }}
              onExpire={() => {
                form.setFieldValue('captcha', '');
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" icon={pending ? <LoadingOutlined /> : <UnlockOutlined />} disabled={pending}>
              Giriş Yap
            </Button>
          </Form.Item>

          <Link href="/kullanici/parolami-unuttum">Parolamı Unuttum</Link>
        </Form>
      </Col>
    </Row>
  );
};

export default SignInForm;
