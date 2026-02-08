'use client';

import { useEffect, useState } from 'react';

import { Card, Radio } from 'antd';
import { CategoryScale, Chart as ChartJS, ChartOptions, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';

import shippingsStats from '@/app/actions/user/shippingsStats';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const options: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

type ShippingStatsType = 'monthly' | 'yearly';

const Shippings = () => {
  const [type, setType] = useState<ShippingStatsType>('monthly');
  const [stats, setStats] = useState<IShippingStats>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await shippingsStats(type);
        setStats(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  const data = {
    labels: stats?.keys ?? [],
    datasets: [
      {
        label: 'Gönderi Adedi',
        data: stats?.datas ?? [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  return (
    <Card
      loading={loading}
      title="Yapılan Gönderi"
      extra={
        <Radio.Group
          buttonStyle="solid"
          options={[
            { label: 'Aylık', value: 'monthly' },
            { label: 'Yıllık', value: 'yearly' },
          ]}
          onChange={e => setType(e.target.value)}
          value={type}
          optionType="button"
        />
      }
    >
      <Line options={options} data={data} />
    </Card>
  );
};

export default Shippings;
