// src/components/CarList.js

import React, { useState, useEffect } from "react";
import axios from "../axiosConfig";
import { Table, Input, Button, InputNumber, Slider, DatePicker, message, Card, Row, Col, Pagination, Drawer } from "antd";
import { DownloadOutlined, FilterOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import moment from "moment";
import "moment/locale/tr";
import { Select } from "antd";
import "./CarList.css";

moment.locale("tr");

function CarList() {
  const [cars, setCars] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filteredCars, setFilteredCars] = useState([]);
  const [totalCarsInDB, setTotalCarsInDB] = useState(0);
  const [medianPrices, setMedianPrices] = useState({});
  const [loadingExport, setLoadingExport] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // Ekran boyutu kontrolü
  const [showFilters, setShowFilters] = useState(false); // Mobilde filtre görünürlüğü

  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    series: [],
    models: [],
    cities: [],
    districts: [],
  });
  const [filters, setFilters] = useState({
    brand: null,
    series: null,
    model: null,
    city: null,
    district: null,
    yearRange: [2000, 2024],
    kmRange: [0, 1000000],
    priceRange: [0, 3000000],
    adDateRange: [null, null],
  });

  useEffect(() => {
    fetchCars();
    fetchBrands();
    fetchCities(); 
    fetchTotalCars();
    handleResize(); // İlk yüklemede ekran boyutunu kontrol et
    window.addEventListener('resize', handleResize); // Pencere boyutu değiştiğinde kontrol et
console.log(filteredCars);

    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup
    };
  }, [page, pageSize]);

  const handleResize = () => {
    if (window.innerWidth < 768) { // 768px'den küçükse mobil olarak kabul et
      setIsMobile(true);
    } else {
      setIsMobile(false);
      setShowFilters(false); // Masaüstüne geçildiğinde filtreleri gizle
    }
  };

  const fetchCities = () => {
    axios
      .get("/cars/all-cities")
      .then((res) => {
        setFilterOptions((prev) => ({ ...prev, cities: res.data.cities }));
      })
      .catch((err) => {
        console.error("İller alınırken hata:", err);
      });
  };

  const fetchTotalCars = () => {
    axios
      .get("/cars/total")
      .then((res) => {
        setTotalCarsInDB(res.data.totalCars);
      })
      .catch((err) => {
        console.error("Toplam araç sayısı alınırken hata:", err);
      });
  };

  const fetchBrands = () => {
    axios
      .get("/cars/filters")
      .then((res) => {
        setFilterOptions((prev) => ({ ...prev, brands: res.data.brands }));
      })
      .catch((err) => {
        console.error("Markalar alınırken hata:", err);
      });
  };

  const fetchCars = async () => {
    const params = {
      page,
      limit: pageSize,
      brand: filters.brand,
      series: filters.series,
      model: filters.model,
      city: filters.city,
      ilce: filters.district, // İlçe parametresi
      yearMin: filters.yearRange ? filters.yearRange[0] : null,
      yearMax: filters.yearRange ? filters.yearRange[1] : null,
      kmMin: filters.kmRange ? filters.kmRange[0] : null,
      kmMax: filters.kmRange ? filters.kmRange[1] : null,
      priceMin: filters.priceRange ? filters.priceRange[0] : null,
      priceMax: filters.priceRange ? filters.priceRange[1] : null,
      adDateStart: filters.adDateRange[0]
        ? filters.adDateRange[0].format("YYYY-MM-DD")
        : null,
      adDateEnd: filters.adDateRange[1]
        ? filters.adDateRange[1].format("YYYY-MM-DD")
        : null,
    };

    try {
      const res = await axios.get("/cars", { params });
      const carsData = res.data.cars;
      setCars(carsData);
      setTotal(res.data.total);
      setFilteredCars(carsData);

      // Her araç için medyan fiyatı al
      const medianPricesData = {};
      for (const car of carsData) {
        const response = await axios.get(`/cars/${car._id}/similar-price`);
        medianPricesData[car._id] = response.data;
      }
      setMedianPrices(medianPricesData);
    } catch (err) {
      console.error("Veriler alınırken hata:", err);
    }
  };

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleBrandChange = (brand) => {
    if (brand) {
      // Seri, model ve i̇l seçimlerini sıfırla
      setFilters((prev) => ({
        ...prev,
        series: null,
        model: null,
        city: null,
      }));
      setFilterOptions((prev) => ({
        ...prev,
        series: [],
        models: [],
        cities: [],
      }));
      // Seçilen markaya ait serileri getir
      axios
        .get("/cars/series", { params: { brand } })
        .then((res) => {
          setFilterOptions((prev) => ({ ...prev, series: res.data.series }));
        })
        .catch((err) => {
          console.error("Seriler alınırken hata:", err);
        });
    } else {
      // Marka seçimi temizlendiyse, seri, model ve i̇l seçimlerini ve seçeneklerini sıfırla
      setFilters((prev) => ({
        ...prev,
        series: null,
        model: null,
        city: null,
      }));
      setFilterOptions((prev) => ({
        ...prev,
        series: [],
        models: [],
        cities: [],
      }));
    }
  };

  const handleSeriesChange = (series) => {
    if (series) {
      // Model ve i̇l seçimlerini sıfırla
      setFilters((prev) => ({
        ...prev,
        model: null,
        city: null,
      }));
      setFilterOptions((prev) => ({
        ...prev,
        models: [],
        cities: [],
      }));
      // Seçilen marka ve seriye ait modelleri getir
      axios
        .get("/cars/models", { params: { brand: filters.brand, series } })
        .then((res) => {
          setFilterOptions((prev) => ({ ...prev, models: res.data.models }));
        })
        .catch((err) => {
          console.error("Modeller alınırken hata:", err);
        });
    } else {
      // Seri seçimi temizlendiyse, model ve i̇l seçimlerini ve seçeneklerini sıfırla
      setFilters((prev) => ({
        ...prev,
        model: null,
        city: null,
      }));
      setFilterOptions((prev) => ({
        ...prev,
        models: [],
        cities: [],
      }));
    }
  };

  const handleModelChange = (model) => {
    if (model) {
      // İl seçimini sıfırla
      setFilters((prev) => ({
        ...prev,
        city: null,
      }));
      setFilterOptions((prev) => ({
        ...prev,
        cities: [],
      }));
      // Seçilen marka, seri ve modele ait i̇lları getir
      axios
        .get("/cars/cities", {
          params: { brand: filters.brand, series: filters.series, model },
        })
        .then((res) => {
          setFilterOptions((prev) => ({
            ...prev,
            cities: res.data.cities,
          }));
        })
        .catch((err) => {
          console.error("İllar alınırken hata:", err);
        });
    } else {
      // Model seçimi temizlendiyse, i̇l seçimini ve seçeneklerini sıfırla
      setFilters((prev) => ({
        ...prev,
        city: null,
      }));
      setFilterOptions((prev) => ({
        ...prev,
        cities: [],
      }));
    }
  };

  const handleCityChange = (city) => {
    if (city) {
      // İlçe seçimini sıfırla
      setFilters((prev) => ({
        ...prev,
        district: null,
      }));
      setFilterOptions((prev) => ({
        ...prev,
        districts: [],
      }));
      // Seçilen ile ait ilçeleri getir
      axios
        .get("/cars/districts", { params: { city } })
        .then((res) => {
          setFilterOptions((prev) => ({
            ...prev,
            districts: res.data.districts,
          }));
        })
        .catch((err) => {
          console.error("İlçeler alınırken hata:", err);
        });
    } else {
      // İl seçimi temizlendiyse, ilçe seçimini ve seçeneklerini sıfırla
      setFilters((prev) => ({
        ...prev,
        district: null,
      }));
      setFilterOptions((prev) => ({
        ...prev,
        districts: [],
      }));
    }
  };

  const applyFilters = () => {
    setPage(1); // Filtreleme yapıldığında sayfayı 1'e ayarlayalım
    fetchCars();
    if (isMobile) {
      setShowFilters(false); // Filtre uygulandıktan sonra filtre panelini kapat
    }
  };

  const resetFilters = () => {
    setFilters({
      brand: null,
      series: null,
      model: null,
      city: null,
      district: null,
      yearRange: [2000, 2024],
      kmRange: [0, 1000000],
      priceRange: [0, 3000000],
      adDateRange: [null, null],
    });
    setFilteredCars(cars);
    if (isMobile) {
      setShowFilters(false); // Filtre sıfırlandıktan sonra filtre panelini kapat
    }
  };

  // Güncellenmiş exportToExcel fonksiyonu
  const exportToExcel = async () => {
    setLoadingExport(true); 

    try {
      const res = await axios.get("/cars", {
        params: {
          page: 1,
          limit: totalCarsInDB, 
        },
      });

      const allCars = res.data.cars;

      if (!allCars || allCars.length === 0) {
        message.warning("İndirilecek araç bulunamadı.");
        setLoadingExport(false);
        return;
      }

      // Veriyi Excel formatına dönüştürmek için map işlemi
      const data = allCars.map((car) => ({
        İlanID: car.adId,
        Marka: car.brand,
        Seri: car.series,
        Model: car.model,
        Başlık: car.title,
        Yıl: car.year,
        KM: car.km,
        Fiyat: car.price,
        İlanTarihi: car.adDate ? moment(car.adDate).format("YYYY-MM-DD") : "-",
        İl: car.city,
        İlçe: car.ilce,
        Semt: car.semt,
        Mahalle: car.mahalle,
        SonGörüntülenme: car.lastSeenDate ? moment(car.lastSeenDate).format("YYYY-MM-DD HH:mm:ss") : "-",
        İlanURL: car.adUrl,
      }));

      // Excel dosyasını oluşturma
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Araçlar");

      // Dosyayı indirme
      XLSX.writeFile(workbook, "arac_listesi_tum.xlsx");

      message.success("Excel dosyası başarıyla indirildi.");
    } catch (error) {
      console.error("Excel dosyası indirilirken hata:", error);
      message.error("Excel dosyası indirilirken bir hata oluştu.");
    } finally {
      setLoadingExport(false); // İndirme işlemi tamamlandığında loading durumunu kapat
    }
  };

  const columns = [
    {
      title: "Resim",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (text) => <img src={text} alt="Araç" width="100" />,
    },
    {
      title: "Marka",
      dataIndex: "brand",
      key: "brand",
    },
    {
      title: "Seri",
      dataIndex: "series",
      key: "series",
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
    },
    {
      title: "Başlık",
      dataIndex: "title",
      key: "title",
      render: (text, record) => <a href={record.adUrl}>{text}</a>,
    },
    {
      title: "Yıl",
      dataIndex: "year",
      key: "year",
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: "KM",
      dataIndex: "km",
      key: "km",
      sorter: (a, b) => a.km - b.km,
      render: (text) => text ? text.toLocaleString('tr-TR') : '-',
    },
    {
      title: "Fiyat",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (text) => `${text.toLocaleString()} TL`,
    },
    {
      title: "İlan Tarihi",
      dataIndex: "adDate",
      key: "adDate",
      render: (text) => text ? moment(text).format("LL") : '-', // Sadece tarih formatında
    },
    
    {
      title: "İl/İlçe",
      dataIndex: "city",
      key: "city",
      render: (text, record) => `${text} / ${record.ilce}`,
    },

    {
      title: "Ortalama Fiyat (TL)",
      dataIndex: "_id",
      key: "medianPrice",
      render: (text, record) => {
        const medianData = medianPrices[record._id];
        if (medianData) {
          return `${medianData.medianPrice.toLocaleString()} TL (${medianData.count} araç)`;
        } else {
          return "-";
        }
      },
    },
    {
      title: "Fiyat Farkı (%)",
      dataIndex: "_id",
      key: "priceDifference",
      render: (text, record) => {
        const medianData = medianPrices[record._id];
        if (medianData && medianData.medianPrice > 0) {
          const priceDifferencePercent =
            ((record.price - medianData.medianPrice) / medianData.medianPrice) *
            100;
          const color = priceDifferencePercent < 0 ? "green" : "red";
          const sign = priceDifferencePercent < 0 ? "-" : "+";
          return (
            <span style={{ color }}>
              {sign}
              {Math.abs(priceDifferencePercent).toFixed(2)}%
            </span>
          );
        } else {
          return "-";
        }
      },
    },
  ];

  // Kart bileşeni için helper fonksiyon
  const renderCard = (car) => {
    const medianData = medianPrices[car._id];
    let averagePrice = '-';
    let priceDifference = '-';
  
    if (medianData) {
      averagePrice = `${medianData.medianPrice.toLocaleString()} TL (${medianData.count} araç)`;
      if (medianData.medianPrice > 0) {
        const priceDifferencePercent =
          ((car.price - medianData.medianPrice) / medianData.medianPrice) *
          100;
        const color = priceDifferencePercent < 0 ? "green" : "red";
        const sign = priceDifferencePercent < 0 ? "-" : "+";
        priceDifference = (
          <span style={{ color }}>
            {sign}
            {Math.abs(priceDifferencePercent).toFixed(2)}%
          </span>
        );
      }
    }
  
    return (
      <Card key={car.adId} className="car-card">
        <Row>
          <Col xs={8}>
            <img src={car.imageUrl} alt="Araç" className="car-image" />
          </Col>
          <Col xs={16}>
            <div className="car-details">
              <h3 className="car-title">{car.title}</h3>
              <div className="car-info">
                <div className="car-brand-model">
                  <span><strong>Marka/Seri/Model:</strong> {car.brand} / {car.series} / {car.model}</span>
                </div>
                <div className="car-year-km">
                  <span><strong>Yıl/KM:</strong> {car.year} / {car.km ? car.km.toLocaleString() : '-'} KM</span>
                </div>
                <div className="car-location">
                  <span><strong>Konum:</strong> {car.city} / {car.ilce}</span>
                </div>
                <div className="car-price">
                  <span><strong>Fiyat:</strong> {car.price.toLocaleString()} TL</span>
                </div>
                <div className="car-average-price">
                  <span><strong>Ortalama Fiyat:</strong> {averagePrice}</span>
                </div>
                <div className="car-price-difference">
                  <span><strong>Fiyat Farkı:</strong> {priceDifference}</span>
                </div>
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
      <h3>Filtreler</h3>
      <div className="filter-item">
        <label>Marka:</label>
        <Select
          showSearch
          placeholder="Marka Seçiniz"
          value={filters.brand}
          onChange={(value) => {
            handleFilterChange("brand", value);
            handleBrandChange(value);
          }}
          options={filterOptions.brands.map((brand) => ({
            value: brand,
            label: brand,
          }))}
          allowClear
          style={{ width: "100%" }}
        />
      </div>

      <div className="filter-item">
        <label>Seri:</label>
        <Select
          showSearch
          placeholder="Seri Seçiniz"
          value={filters.series}
          onChange={(value) => {
            handleFilterChange("series", value);
            handleSeriesChange(value);
          }}
          options={filterOptions.series.map((series) => ({
            value: series,
            label: series,
          }))}
          allowClear
          style={{ width: "100%" }}
          disabled={!filters.brand} // Marka seçilmediyse disable
        />
      </div>

      <div className="filter-item">
        <label>Model:</label>
        <Select
          showSearch
          placeholder="Model Seçiniz"
          value={filters.model}
          onChange={(value) => {
            handleFilterChange("model", value);
            handleModelChange(value);
          }}
          options={filterOptions.models.map((model) => ({
            value: model,
            label: model,
          }))}
          allowClear
          style={{ width: "100%" }}
          disabled={!filters.series} // Seri seçilmediyse disable
        />
      </div>

      <div className="filter-item">
        <label>İl:</label>
        <Select
          showSearch
          placeholder="İl Seçiniz"
          value={filters.city}
          onChange={(value) => {
            handleFilterChange("city", value);
            handleCityChange(value);
          }}
          options={filterOptions.cities.map((city) => ({
            value: city,
            label: city,
          }))}
          allowClear
          style={{ width: "100%" }}
        />
      </div>

      <div className="filter-item">
        <label>İlçe:</label>
        <Select
          showSearch
          placeholder="İlçe Seçiniz"
          value={filters.district}
          onChange={(value) => handleFilterChange("district", value)}
          options={filterOptions.districts.map((district) => ({
            value: district,
            label: district,
          }))}
          allowClear
          style={{ width: "100%" }}
          disabled={!filters.city} // İl seçilmediyse disable
        />
      </div>

      <div className="filter-item">
        <label>Yıl Aralığı:</label>
        <Slider
          range
          min={1985}
          max={2024}
          value={filters.yearRange}
          onChange={(value) => handleFilterChange("yearRange", value)}
        />
      </div>
      <div className="filter-item">
        <label>KM Aralığı:</label>
        <Slider
          range
          min={0}
          max={1500000}
          step={1000}
          value={filters.kmRange}
          onChange={(value) => handleFilterChange("kmRange", value)}
        />
      </div>
      <div className="filter-item">
        <label>Fiyat Aralığı (TL):</label>
        <Slider
          range
          min={0}
          max={5000000}
          step={10000}
          value={filters.priceRange}
          onChange={(value) => handleFilterChange("priceRange", value)}
        />
      </div>
      <div className="filter-item">
        <label>İlan Tarihi:</label>
        <DatePicker.RangePicker
          format="DD.MM.YYYY"
          value={filters.adDateRange}
          onChange={(dates) => handleFilterChange("adDateRange", dates)}
        />
      </div>
      <Button
        type="primary"
        onClick={applyFilters}
        style={{ marginTop: "10px" }}
        block
      >
        Filtrele
      </Button>
      <Button onClick={resetFilters} style={{ marginTop: "10px" }} block>
        Filtreleri Sıfırla
      </Button>
    </div>
  );

  return (
    <div className="carlist-container" style={{ display: "flex", flexDirection: isMobile ? 'column' : 'row' }}>
      {/* Filtre Bölümü */}
      {!isMobile ? (
        <div
          className="filter-section"
          style={{
            width: "250px",
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
            style={{ margin: '10px',width:"auto" }}
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
      <div className="table-section" style={{ flex: 1, padding: "10px" }}>
        <div className="sum-flex">
          <div className="sum-flex-filter">
            Filtrelenen Araç Sayısı:<span>{total}</span>{" "}
          </div>
          <div className="sum-flex-total">
            Toplam Araç Sayısı: <span>{totalCarsInDB}</span>
          </div>
        </div>
        {/* Tablo veya Kart içeriği */}
        <div style={{ flex: 1, padding: "10px" }}>
          {isMobile ? (
            <>
              <div className="card-container">
                {filteredCars.map(car => renderCard(car))}
              </div>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                onChange={(page, pageSize) => {
                  setPage(page);
                  setPageSize(pageSize);
                }}
                showSizeChanger
                style={{ marginTop: '16px', textAlign: 'center' }}
              />
            </>
          ) : (
            <Table
              dataSource={filteredCars}
              columns={columns}
              rowKey="adId"
              pagination={{
                current: page,
                pageSize: pageSize,
                total: total,
                onChange: (page, pageSize) => {
                  setPage(page);
                  setPageSize(pageSize);
                },
                showSizeChanger: true,
              }}
              scroll={{ x: 800 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CarList;
