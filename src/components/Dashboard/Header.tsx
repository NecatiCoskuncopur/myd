'use client';

import { useRouter } from 'next/navigation';

import { ApiFilled } from '@ant-design/icons';
import { Button, Col, Layout, Row } from 'antd';

import signOut from '@/app/actions/auth/signOut';

const { Header } = Layout;

const MydHeader = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/kullanici/giris');
  };

  return (
    <Header>
      <Row justify="end">
        <Col>
          <Button block onClick={handleLogout} tabIndex={-999}>
            <ApiFilled />
            Çıkış Yap
          </Button>
        </Col>
      </Row>
    </Header>
  );
};

export default MydHeader;
