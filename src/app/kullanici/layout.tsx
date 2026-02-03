import React from 'react';

import { Col, Row } from 'antd';
import styled from 'styled-components';

type AuthLayoutProps = {
  children: React.ReactNode;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <StyledRow>
      <Col xs={24} sm={24} md={14} lg={8}>
        {children}
      </Col>
      <Col xs={0} sm={0} md={10} lg={16}>
        <ImageWrapper />
      </Col>
    </StyledRow>
  );
};

export default AuthLayout;

const StyledRow = styled(Row)`
  height: 100vh;
`;

const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-image: url('/images/authSide.jpg');
  background-size: cover;
`;
