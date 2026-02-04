'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';

import { BankOutlined, EnvironmentOutlined, LoadingOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Row, Typography } from 'antd';

import signUp from '@/app/actions/auth/signUp';
import HCaptchaField from './HCaptcha';
import SignUpSuccess from './SignUpSuccess';

const SignUpForm = () => {
  const [form] = Form.useForm<ISignUpForm>();
  const [pending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const onFinish = (values: ISignUpForm) => {
    startTransition(async () => {
      try {
        await signUp({
          ...values,
          recaptchaToken: values.recaptchaToken,
        });

        setIsSuccess(true);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes('email')) {
            setEmailError('Bu E-Posta adresi zaten kayıtlı!');
          } else {
            message.error(error.message);
          }
        } else {
          message.error('Kayıt sırasında hata oluştu');
        }

        form.resetFields(['recaptchaToken']);
      }
    });
  };

  if (isSuccess) {
    return (
      <Row style={{ height: '100%' }} align="middle" justify="center">
        <SignUpSuccess />
      </Row>
    );
  }

  return (
    <Row style={{ height: '100%' }} align="middle" justify="center">
      <Col span={16}>
        <Row style={{ marginBottom: 20 }}>
          <img src="/images/logo.svg" width={150} alt="logo" />
        </Row>

        <Typography.Title level={3}>Kayıt Ol</Typography.Title>

        <Typography.Text>
          Zaten kayıt oldunuz mu? <Link href="/kullanici/giris">Giriş Yap</Link>
        </Typography.Text>

        <Form form={form} layout="vertical" autoComplete="off" onFinish={onFinish}>
          <Row justify="space-between">
            <Col span={11}>
              <Form.Item label="Ad" name="firstName" rules={[{ required: true }, { min: 2 }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col span={11}>
              <Form.Item label="Soyad" name="lastName" rules={[{ required: true }, { min: 2 }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="space-between">
            <Col span={11}>
              <Form.Item label="Firma İsmi" name="company">
                <Input prefix={<BankOutlined />} />
              </Form.Item>
            </Col>

            <Col span={11}>
              <Form.Item label="Telefon No" name="phone" rules={[{ required: true }]}>
                <Input
                  prefix={
                    <>
                      <PhoneOutlined /> <span>+90</span>
                    </>
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="space-between">
            <Col span={11}>
              <Form.Item
                label="E-Posta"
                name="email"
                validateStatus={emailError ? 'error' : ''}
                help={emailError ?? undefined}
                rules={[{ required: true }, { type: 'email' }]}
              >
                <Input prefix={<MailOutlined />} onChange={() => setEmailError(null)} />
              </Form.Item>
            </Col>

            <Col span={11}>
              <Form.Item label="Parola" name="password" rules={[{ required: true }, { min: 8 }]}>
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Adres" name={['address', 'line1']} rules={[{ required: true }]}>
            <Input prefix={<EnvironmentOutlined />} />
          </Form.Item>

          <Form.Item name={['address', 'line2']}>
            <Input placeholder="Adres satırı 2" />
          </Form.Item>

          <Row justify="space-between">
            <Col span={7}>
              <Form.Item name={['address', 'district']} rules={[{ required: true }]}>
                <Input placeholder="İlçe" />
              </Form.Item>
            </Col>

            <Col span={7}>
              <Form.Item name={['address', 'city']} rules={[{ required: true }]}>
                <Input placeholder="İl" />
              </Form.Item>
            </Col>

            <Col span={7}>
              <Form.Item name={['address', 'postalCode']} rules={[{ required: true }]}>
                <Input placeholder="Posta Kodu" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="recaptchaToken" rules={[{ required: true }]}>
            <HCaptchaField
              onVerify={token => {
                form.setFieldValue('recaptchaToken', token);
              }}
              onExpire={() => {
                form.setFieldValue('recaptchaToken', '');
              }}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large" disabled={pending} icon={pending ? <LoadingOutlined /> : undefined}>
            Kayıt Ol
          </Button>
        </Form>
      </Col>
    </Row>
  );
};

export default SignUpForm;
