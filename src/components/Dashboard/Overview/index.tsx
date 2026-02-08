'use client';

import { Col, Row } from 'antd';

import HeatMap from './HeatMap';
import Shippings from './Shippings';

const Overview = () => {
  return (
    <Row gutter={16}>
      <Col span={12}>
        <Shippings />
      </Col>

      <Col span={12}>
        <HeatMap />
      </Col>
    </Row>
  );
};

export default Overview;
