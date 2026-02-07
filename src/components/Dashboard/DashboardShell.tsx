'use client';

import { Layout } from 'antd';
import styled from 'styled-components';

import { Footer, Header, SideMenu } from '@/components';
import { UserRole } from '@/lib/getCurrentUser';

const { Content } = Layout;

type Props = {
  children: React.ReactNode;
  role: UserRole | '';
};

const DashboardShell = ({ children, role }: Props) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SideMenu role={role} />
      <Layout>
        <Header />
        <Content style={{ margin: '0 16px' }}>
          <Wrapper>{children}</Wrapper>
        </Content>
        <Footer />
      </Layout>
    </Layout>
  );
};

export default DashboardShell;

const Wrapper = styled.div`
  background: #fff;
  padding: 24px;
  height: 100%;
  margin-top: 20px;
`;
