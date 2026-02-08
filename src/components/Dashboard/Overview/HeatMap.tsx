'use client';

import { useEffect, useState } from 'react';

import { Card, Row } from 'antd';
import WorldMap from 'react-svg-worldmap';

import heatMap from '@/app/actions/user/heatMap';

const HeatMap = () => {
  const [data, setData] = useState<IHeatMap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await heatMap();
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card title="Gönderi Yapılan Bölgeler" loading={loading}>
      <Row
        style={{
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <WorldMap valueSuffix="Gönderi" color="green" size="xl" data={data} />
      </Row>
    </Card>
  );
};

export default HeatMap;
