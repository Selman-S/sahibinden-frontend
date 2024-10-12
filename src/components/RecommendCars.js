// src/components/RecommendCars.js

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Card, Table, Slider, Drawer, Pagination, Row, Col, message } from 'antd';
import axios from '../axiosConfig';
import { FilterOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/tr';
import './RecommendCars.css'; // CSS dosyanızı gerektiği gibi güncelleyebilirsiniz


const { Option } = Select;

const RecommendCars = () => {
  const [form] = Form.useForm();
  const [recommendedCars, setRecommendedCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [series, setSeries] = useState([]);
  const [models, setModels] = useState([]);
  const [showFilters, setShowFilters] = useState(false); // Mobilde filtre görünürlüğü

  const [isMobile, setIsMobile] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchBrands();
    handleResize(); // İlk yüklemede ekran boyutunu kontrol et
    window.addEventListener('resize', handleResize); // Pencere boyutu değiştiğinde kontrol et

    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup
    };
  }, []);

  const handleResize = () => {
 
    
    if (window.innerWidth < 768) { // 768px'den küçükse mobil olarak kabul et
      setIsMobile(true);
    } else {
      setIsMobile(false);
      setShowFilters(false); // Masaüstüne geçildiğinde filtreleri gizle
    }
  };



  const fetchBrands = async () => {
    try {
      const response = await axios.get('/cars/brands');
      setBrands(response.data);
    } catch (error) {
      console.error('Markalar alınırken hata:', error);
    }
  };

  const fetchSeries = async (brand) => {
    try {
      const response = await axios.get(`/cars/series/${brand}`);
      setSeries(response.data);
    } catch (error) {
      console.error('Seriler alınırken hata:', error);
    }
  };

  const fetchModels = async (brand, series) => {
    try {
      const response = await axios.get(`/cars/models/${brand}/${series}`);
      setModels(response.data);
    } catch (error) {
      console.error('Modeller alınırken hata:', error);
    }
  };

  const onBrandChange = (value) => {
    form.setFieldsValue({ series: undefined, model: undefined });
    setSeries([]);
    setModels([]);
    fetchSeries(value);
  };

  const onSeriesChange = (value) => {
    form.setFieldsValue({ model: undefined });
    setModels([]);
    fetchModels(form.getFieldValue('brand'), value);
  };

  const onFinish = async (values, currentPage = 1, currentLimit = 10) => {
    setLoading(true);
    try {
      const params = {
        ...values,
        page: currentPage,
        limit: currentLimit,
      };
      const response = await axios.post('/cars/recommend', params);
      setRecommendedCars(response.data.cars);
      setTotal(response.data.total);
      setPage(response.data.page);
      setPageSize(response.data.limit);
    } catch (error) {
      console.error('Tavsiye edilen araçlar alınırken hata:', error);
      message.error('Tavsiye edilen araçlar alınırken bir hata oluştu.');
    }
    setLoading(false);
  };

  const columns = [
    {
        title: 'Resim',
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        render: (text) => <img src={text} alt="Araç" width="100" />,
      },
      {
        title: 'Marka',
        dataIndex: 'brand',
        key: 'brand',
      },
      {
        title: 'Seri',
        dataIndex: 'series',
        key: 'series',
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
        sorter: (a, b) => a.year - b.year,
      },
      {
        title: 'Kilometre',
        dataIndex: 'km',
        key: 'km',
        sorter: (a, b) => a.km - b.km,
        render: (text) => text ? text.toLocaleString('tr-TR') : '-',
      },
      {
        title: 'Fiyat',
        dataIndex: 'price',
        key: 'price',
        sorter: (a, b) => a.price - b.price,
        render: (text) => `${text.toLocaleString()} TL`,
      },
      {
        title: 'İlan Tarihi',
        dataIndex: 'adDate',
        key: 'adDate',
        render: (text) => text ? moment(text).format("LL") : '-', // Sadece tarih formatında
      },
      {
        title: 'Benzer Araç Sayısı',
        dataIndex: 'similarCount',
        key: 'similarCount',
        sorter: (a, b) => a.similarCount - b.similarCount,
        render: (text) => text || 0,
      },
      {
        title: 'Ortalama Fiyat (TL)',
        dataIndex: 'averagePrice',
        key: 'averagePrice',
        sorter: (a, b) => a.averagePrice - b.averagePrice,
        render: (text) => `${text.toLocaleString()} TL`,
      },
  ];

    // Tablo satırına tıklama işlemi
    const onRowClick = (record) => {
        window.open(record.adUrl, '_blank');
      };

      const renderCard = (car) => {
        return (
          <Card 
            key={car.adId} 
            className="car-card" 
            onClick={() => window.open(car.adUrl, '_blank')}
            hoverable
            style={{ marginBottom: '16px' }}
          >
            <Row>
              <Col xs={8}>
                <img src={car.imageUrl} alt="Araç" className="car-image" style={{ width: '100%', height: 'auto' }} />
              </Col>
              <Col xs={16}>
                <div className="car-details">
                  <h3 className="car-title">{car.title}</h3>
                  <div className="car-info">
                    <div className="car-location">
                      <span>{car.city} / {car.ilce}</span>
                    </div>
                    <div className="car-price">
                      <span>{car.price.toLocaleString()} TL</span>
                    </div>
                  </div>
                  <div className="car-year-km">
                    <span>Yıl: {car.year}</span> | <span>KM: {car.km.toLocaleString()}</span>
                  </div>
                  <div className="car-similar">
                    <span>Benzer Araç Sayısı: {car.similarCount || 0}</span> | <span>Ortalama Fiyat: {car.averagePrice ? `${parseFloat(car.averagePrice).toLocaleString()} TL` : '-'}</span>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        );
      };
    
      // Filtre panelini Drawer içinde göstermek (mobilde zaten mevcut)
      const renderFilters = () => (
        <div className="filters">
          <Form form={form} onFinish={onFinish} layout="vertical" >
            <Form.Item name="budget" label="Bütçe">
              <Input type="number" />
            </Form.Item>
            <Form.Item name="brand" label="Marka">
              <Select 
                onChange={onBrandChange}
                placeholder="Marka Seçiniz"
                allowClear
              >
                {brands.map(brand => (
                  <Option key={brand} value={brand}>{brand}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="series" label="Seri">
              <Select 
                onChange={onSeriesChange} 
                disabled={!form.getFieldValue('brand')}
                placeholder="Seri Seçiniz"
                allowClear
              >
                {series.map(s => (
                  <Option key={s} value={s}>{s}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="model" label="Model">
              <Select 
                placeholder="Model Seçiniz"
                disabled={!form.getFieldValue('series')}
                allowClear
              >
                {models.map(model => (
                  <Option key={model} value={model}>{model}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="yearMin" label="Minimum Yıl">
              <Input type="number" />
            </Form.Item>
            <Form.Item name="yearMax" label="Maksimum Yıl">
              <Input type="number" />
            </Form.Item>
            <Form.Item name="kmMax" label="Maksimum Kilometre">
              <Input type="number" />
            </Form.Item>
                      <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Tavsiye Al
              </Button>
              <Button 
                type="default" 
                onClick={() => {
                  form.resetFields();
                  setRecommendedCars([]);
                  setTotal(0);
                  if (isMobile) setShowFilters(false);
                }} 
                style={{ marginTop: '8px' }} 
                block
              >
                Filtreleri Sıfırla
              </Button>
            </Form.Item>
          </Form>
        </div>
      );
    
      return (
        <div className="recommend-cars-container" style={{ display: "flex", flexDirection: isMobile ? 'column' : 'row' }}>
          {/* Filtre Bölümü */}
          {!isMobile ? (
            <div
              className="filter-section"
              style={{
                width: "300px",
                padding: "10px",
                borderRight: "1px solid #ccc",
              }}
            >
              {renderFilters()}
            </div>
          ) : (
            <>
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={() => setShowFilters(true)}
                style={{ margin: '10px', width: "auto" }}
                block
              >
                Filtrele
              </Button>
              <Drawer
                title="Filtreler"
                placement="left"
                onClose={() => setShowFilters(false)}
                visible={showFilters}
                bodyStyle={{ padding: 10 }}
              >
                {renderFilters()}
              </Drawer>
            </>
          )}
    
          {/* Tablo veya Kart Bölümü */}
          <div className="results-section" style={{ flex: 1, padding: "10px" }}>
            <div className="sum-flex" style={{ marginBottom: '16px' }}>
              <div className="sum-flex-filter">
                Filtrelenen Araç Sayısı: <span>{total}</span>
              </div>
            </div>
            {/* Tablo veya Kart içeriği */}
            <div style={{ flex: 1, padding: "10px" }}>
              {isMobile ? (
                <>
                  <div className="card-container">
                    {recommendedCars.map(car => renderCard(car))}
                  </div>
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    onChange={(newPage, newPageSize) => {
                      setPage(newPage);
                      setPageSize(newPageSize);
                      onFinish(form.getFieldsValue(), newPage, newPageSize);
                    }}
                    showSizeChanger
                    style={{ marginTop: '16px', textAlign: 'center' }}
                  />
                </>
              ) : (
                <Table
                  dataSource={recommendedCars}
                  columns={columns}
                  rowKey="adId"
                  loading={loading}
                  pagination={{
                    current: page,
                    pageSize: pageSize,
                    total: total,
                    onChange: (newPage, newPageSize) => {
                      setPage(newPage);
                      setPageSize(newPageSize);
                      onFinish(form.getFieldsValue(), newPage, newPageSize);
                    },
                    showSizeChanger: true,
                  }}
                  onRow={(record) => ({
                    onClick: () => onRowClick(record),
                    style: { cursor: 'pointer' },
                  })}
                  scroll={{ x: 1000 }}
                />
              )}
            </div>
          </div>
        </div>
      );
    };

export default RecommendCars;