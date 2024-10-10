import React, { useState, useEffect } from "react";
import axios from "../axiosConfig";
import { Table, Input, Button, InputNumber, Slider, DatePicker } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import moment from "moment";
import "moment/locale/tr";
import { Select } from "antd";
import "./CarList.css"

moment.locale("tr");

function CarList() {
  const [cars, setCars] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filteredCars, setFilteredCars] = useState([]);
  const [totalCarsInDB, setTotalCarsInDB] = useState(0);
  const [medianPrices, setMedianPrices] = useState({});


  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    series: [],
    models: [],
    locations: [],
  });

  const [filters, setFilters] = useState({
    brand: null,
    series: null,
    model: null,
    location: null,
    yearRange: [2000, 2024],
    kmRange: [0, 500000],
    priceRange: [0, 1000000],
    adDateRange: [null, null],
  });

  useEffect(() => {
    fetchCars();
    fetchBrands();
    fetchTotalCars(); // Toplam araç sayısını getir
  }, [page, pageSize]);

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
      location: filters.location,
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
      const res = await axios.get('/cars', { params });
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
      console.error('Veriler alınırken hata:', err);
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
    console.log("handle");

    if (brand) {
      // Seri, model ve lokasyon seçimlerini sıfırla
      setFilters((prev) => ({
        ...prev,
        series: null,
        model: null,
        location: null,
      }));
      setFilterOptions((prev) => ({
        ...prev,
        series: [],
        models: [],
        locations: [],
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
      // Marka seçimi temizlendiyse, seri, model ve lokasyon seçimlerini ve seçeneklerini sıfırla
      setFilters((prev) => ({
        ...prev,
        series: null,
        model: null,
        location: null,
      }));
      setFilterOptions((prev) => ({
        ...prev,
        series: [],
        models: [],
        locations: [],
      }));
    }
  };

  const handleSeriesChange = (series) => {
    if (series) {
      // Model ve lokasyon seçimlerini sıfırla
      setFilters((prev) => ({
        ...prev,
        model: null,
        location: null,
      }));
      setFilterOptions((prev) => ({
        ...prev,
        models: [],
        locations: [],
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
      // Seri seçimi temizlendiyse, model ve lokasyon seçimlerini ve seçeneklerini sıfırla
      setFilters((prev) => ({
        ...prev,
        model: null,
        location: null,
      }));
      setFilterOptions((prev) => ({
        ...prev,
        models: [],
        locations: [],
      }));
    }
  };

  const handleModelChange = (model) => {
    if (model) {
      // Lokasyon seçimini sıfırla
      setFilters((prev) => ({
        ...prev,
        location: null,
      }));
      setFilterOptions((prev) => ({
        ...prev,
        locations: [],
      }));
      // Seçilen marka, seri ve modele ait lokasyonları getir
      axios
        .get("/cars/locations", {
          params: { brand: filters.brand, series: filters.series, model },
        })
        .then((res) => {
          setFilterOptions((prev) => ({
            ...prev,
            locations: res.data.locations,
          }));
        })
        .catch((err) => {
          console.error("Lokasyonlar alınırken hata:", err);
        });
    } else {
      // Model seçimi temizlendiyse, lokasyon seçimini ve seçeneklerini sıfırla
      setFilters((prev) => ({
        ...prev,
        location: null,
      }));
      setFilterOptions((prev) => ({
        ...prev,
        locations: [],
      }));
    }
  };

  const applyFilters = () => {
    setPage(1); // Filtreleme yapıldığında sayfayı 1'e ayarlayalım
    fetchCars();
  };

  const resetFilters = () => {
    setFilters({
      brand: "",
      series: "",
      model: "",
      location: "",
      yearRange: [2000, 2024],
      kmRange: [0, 500000],
      priceRange: [0, 1000000],
      adDateRange: [null, null],
    });
    setFilteredCars(cars);
  };

  const exportToExcel = () => {
    const data = filteredCars.map((car) => ({
      İlanID: car.adId,
      Marka: car.brand,
      Seri: car.series,
      Model: car.model,
      Başlık: car.title,
      Yıl: car.year,
      KM: car.km,
      Fiyat: car.price,
      İlanTarihi: car.adDate,
      Lokasyon: car.location,
      SonGörüntülenme: moment(car.lastSeenDate).format("LLL"),
      İlanURL: car.adUrl,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Araçlar");

    XLSX.writeFile(workbook, "arac_listesi.xlsx");
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
    },
    {
      title: "Lokasyon",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Son Görüntülenme",
      dataIndex: "lastSeenDate",
      key: "lastSeenDate",
      render: (text) => moment(text).format("LLL"),
    },
    {
      title: "İlan Linki",
      dataIndex: "adUrl",
      key: "adUrl",
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          İlana Git
        </a>
      ),
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
          return '-';
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
          const priceDifferencePercent = ((record.price - medianData.medianPrice) / medianData.medianPrice) * 100;
          const color = priceDifferencePercent < 0 ? 'green' : 'red';
          const sign = priceDifferencePercent < 0 ? '-' : '+';
          return (
            <span style={{ color }}>
              {sign}{Math.abs(priceDifferencePercent).toFixed(2)}%
            </span>
          );
        } else {
          return '-';
        }
      },
    },
  ];

  return (
    <div className="carlist-container" style={{ display: "flex" }}>
      <div
        className="filter-section"
        style={{
          width: "250px",
          padding: "10px",
          borderRight: "1px solid #ccc",
        }}
      >
        <div
          style={{
            width: "250px",
            padding: "10px",
            borderRight: "1px solid #ccc",
          }}
        >
          <h3>Filtreler</h3>
          <div style={{ marginBottom: "10px" }}>
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

          <div style={{ marginBottom: "10px" }}>
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

          <div style={{ marginBottom: "10px" }}>
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

          <div style={{ marginBottom: "10px" }}>
            <label>Lokasyon:</label>
            <Select
              showSearch
              placeholder="Lokasyon Seçiniz"
              value={filters.location}
              onChange={(value) => handleFilterChange("location", value)}
              options={filterOptions.locations.map((location) => ({
                value: location,
                label: location,
              }))}
              allowClear
              style={{ width: "100%" }}
              disabled={!filters.model} // Model seçilmediyse disable
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Yıl Aralığı:</label>
            <Slider
              range
              min={1990}
              max={2024}
              value={filters.yearRange}
              onChange={(value) => handleFilterChange("yearRange", value)}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>KM Aralığı:</label>
            <Slider
              range
              min={0}
              max={500000}
              step={1000}
              value={filters.kmRange}
              onChange={(value) => handleFilterChange("kmRange", value)}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Fiyat Aralığı (TL):</label>
            <Slider
              range
              min={0}
              max={2000000}
              step={10000}
              value={filters.priceRange}
              onChange={(value) => handleFilterChange("priceRange", value)}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
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
          <Button
            type="default"
            icon={<DownloadOutlined />}
            onClick={exportToExcel}
            style={{ marginTop: "10px" }}
            block
          >
            Excel Olarak İndir
          </Button>
        </div>
      </div>
      <div className="table-section" style={{ flex: 1, padding: "10px" }}>
        <div className="sum-flex">
          <div className="sum-flex-filter">Filtrelenen Araç Sayısı:<span>{total}</span> </div>
          <div className="sum-flex-total">Toplam Araç Sayısı: <span>{totalCarsInDB}</span></div>
        </div>
        {/* Tablo içeriği */}
        <div style={{ flex: 1, padding: "10px" }}>
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
        </div>
      </div>
    </div>
  );
}

export default CarList;
