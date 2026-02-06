'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { LoadingOutlined, LockOutlined, MailOutlined, UnlockOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Row, Typography } from 'antd';

import signIn from '@/app/actions/auth/signIn';
import { formMessages } from '@/constants';
import HCaptchaField from '../HCaptcha';

const SignInForm = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const { required, valid } = formMessages;

  const onFinish = (values: ISignInForm) => {
    startTransition(async () => {
      try {
        await signIn({
          email: values.email,
          password: values.password,
          recaptchaToken: values.recaptchaToken,
        });

        router.push('/panel');
      } catch (error: unknown) {
        if (error instanceof Error) {
          message.error(error.message);
        } else {
          message.error('Giriş başarısız');
        }

        form.resetFields(['recaptchaToken']);
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
          <Form.Item
            label="E-Posta"
            name="email"
            rules={[
              { required: true, message: required.email },
              { type: 'email', message: valid.email },
            ]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item label="Parola" name="password" rules={[{ required: true, message: required.password }]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item name="recaptchaToken" rules={[{ required: true, message: required.captcha }]} style={{ width: '100% ' }}>
            <HCaptchaField
              onVerify={token => {
                form.setFieldValue('recaptchaToken', token);
              }}
              onExpire={() => {
                form.setFieldValue('recaptchaToken', '');
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
