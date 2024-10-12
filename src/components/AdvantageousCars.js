// src/components/Advantageous.js

import React, { useState, useEffect } from 'react';
import { Table, Card, Tag } from 'antd';
import axios from '../axiosConfig';

const AdvantageousCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvantageousCars();
  }, []);

  const fetchAdvantageousCars = async () => {
    try {
      const response = await axios.get('/cars/advantageous');
      setCars(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Avantajlı araçlar alınırken hata:', error);
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Marka',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Yıl',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Fiyat',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString()} TL`,
    },
    {
      title: 'Ortalama Fiyat',
      dataIndex: 'averagePrice',
      key: 'averagePrice',
      render: (price) => `${price.toLocaleString()} TL`,
    },
    {
      title: 'Fiyat Farkı',
      dataIndex: 'priceDifference',
      key: 'priceDifference',
      render: (diff) => (
        <Tag color={diff < 0 ? 'green' : 'red'}>
          {diff.toFixed(2)}%
        </Tag>
      ),
    },
  ];

  return (
    <Card title="Avantajlı Araçlar">
      <Table
        dataSource={cars}
        columns={columns}
        rowKey="adId"
        loading={loading}
      />
    </Card>
  );
};

export default AdvantageousCars;