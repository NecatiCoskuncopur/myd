'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { CaretRightFilled, LoadingOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Row, Typography } from 'antd';

import resetPassword from '@/app/actions/auth/resetPassword';
import { formMessages } from '@/constants';
import ResetPasswordSuccess from './ResetPasswordSuccess';

interface IFormValues {
  newPassword: string;
  newPasswordRepeat: string;
}

const ResetPasswordForm = () => {
  const { secret } = useParams<{ secret: string }>();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const { required, minLength, maxLength } = formMessages;

  const onFinish = (values: IFormValues) => {
    if (values.newPassword !== values.newPasswordRepeat) {
      message.error('Yeni parolanızı iki kutucuğa da aynı şekilde yazmalısınız!');
      return;
    }

    startTransition(async () => {
      try {
        const payload: IResetPasswordForm = {
          token: secret,
          newPassword: values.newPassword,
        };

        await resetPassword(payload);
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
        <ResetPasswordSuccess />
      </Row>
    );
  }

  return (
    <Row style={{ height: '100%' }} align="middle" justify="center">
      <Col span={12}>
        <Row style={{ marginBottom: 20 }}>
          <img src="/images/logo.svg" width={150} alt="Logo" />
        </Row>

        <Row>
          <Typography.Title level={3}>Yeni Parola Belirle</Typography.Title>
        </Row>

        <Row style={{ marginBottom: 30 }}>
          <Typography.Text>
            Eski parolanı hatırladın mı? <Link href="/kullanici/giris">Giriş Yap</Link>
          </Typography.Text>
        </Row>

        <Form onFinish={onFinish} autoComplete="off" layout="vertical">
          <Form.Item label="Yeni Parola" name="newPassword" rules={[{ required: true, message: required.newPassword }, { min: 8 }, { max: 255 }]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            label="Yeni Parola Tekrar"
            name="newPasswordRepeat"
            rules={[
              { required: true, message: required.newPasswordRepeat },
              { min: 8, message: minLength.password },
              { max: 255, message: maxLength.password },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" icon={isPending ? <LoadingOutlined /> : <CaretRightFilled />} disabled={isPending}>
              Parolayı Ayarla
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

export default ResetPasswordForm;
