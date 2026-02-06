'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';

import { CaretRightFilled, LoadingOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Row, Typography } from 'antd';

import forgotPassword from '@/app/actions/auth/forgotPassword';
import { formMessages } from '@/constants';
import ForgotPasswordSuccess from './ForgotPasswordSuccess';

const ForgotPasswordForm = () => {
  const [isPending, startTransition] = useTransition();
  const [form] = Form.useForm();
  const [success, setSuccess] = useState(false);
  const { required, valid } = formMessages;

  const onFinish = (values: IForgotPasswordForm) => {
    startTransition(async () => {
      try {
        await forgotPassword({ email: values.email });
        setSuccess(true);
      } catch (error: unknown) {
        if (error instanceof Error) {
          message.error(error.message);
        } else {
          message.error('Bir hata oluştu');
        }
      }
    });
  };

  if (success) {
    return (
      <Row style={{ height: '100%' }} align="middle" justify="center">
        <ForgotPasswordSuccess />
      </Row>
    );
  }

  return (
    <Row style={{ height: '100%' }} align="middle" justify="center">
      <Col span={12}>
        <Row style={{ marginBottom: 20 }}>
          <img src="/images/logo.svg" width={150} alt="logo" />
        </Row>

        <Row>
          <Typography.Title level={3}>Parolamı Unuttum</Typography.Title>
        </Row>

        <Row style={{ marginBottom: 30 }}>
          <Typography.Text>
            Parolanı hatırladın mı? <Link href="/kullanici/giris">Giriş Yap</Link>
          </Typography.Text>
        </Row>

        <Form form={form} onFinish={onFinish} autoComplete="off" layout="vertical">
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

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" icon={isPending ? <LoadingOutlined /> : <CaretRightFilled />} disabled={isPending}>
              Sıfırlama Linkini Gönder
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

export default ForgotPasswordForm;
