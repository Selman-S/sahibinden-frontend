// src/components/Layout.js

import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Button, Drawer } from 'antd';
import { 
  LogoutOutlined, 
  UserOutlined, 
  CarOutlined, 
  PaperClipOutlined, 
  OrderedListOutlined,
  MenuOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import './Layout.css'; // Stil dosyasını ekleyin

const { Header, Content, Footer } = AntLayout;

function Layout({ children, userRole, onLogout }) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false); // Ekran boyutu kontrolü
  const [drawerVisible, setDrawerVisible] = useState(false); // Drawer görünürlüğü

  const handleLogout = () => {
    axios.post('/auth/logout')
      .then(() => {
        onLogout();
      })
      .catch(err => {
        console.error('Çıkış yaparken hata:', err);
      });
  };

  const menuItems = [
    { key: '1', icon: <CarOutlined />, label: 'Araç Listesi', onClick: () => navigate('/') },
    { key: '2', icon: <PaperClipOutlined />, label: 'Avantajlı Araçlar', onClick: () => navigate('/advantageous') },
    { key: '3', icon: <OrderedListOutlined />, label: 'Tavsiye', onClick: () => navigate('/recommend') },
  ];

  if (userRole === 'admin') {
    menuItems.push({ key: '4', icon: <UserOutlined />, label: 'Kullanıcı Yönetimi', onClick: () => navigate('/users') });
  }

  useEffect(() => {
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
      setDrawerVisible(false); // Masaüstüne geçildiğinde Drawer'ı kapat
    }
  };

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <AntLayout>
        <Header className="header">
          <div className="logo">
            <img width={164} src="./carlogo.png" alt="Logo" />
          </div>
          {isMobile ? (
            <>
              <Button 
                type="primary" 
                icon={<MenuOutlined />} 
                onClick={showDrawer} 
                className="hamburger-button"
              />
              <Drawer
                title="Menü"
                placement="left"
                onClose={onCloseDrawer}
                visible={drawerVisible}
                bodyStyle={{ padding: 0 }}
              >
                <Menu mode="inline" defaultSelectedKeys={['1']} onClick={onCloseDrawer}>
                  {menuItems.map(item => (
                    <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                      {item.label}
                    </Menu.Item>
                  ))}
                  <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                    Çıkış Yap
                  </Menu.Item>
                </Menu>
              </Drawer>
            </>
          ) : (
            <div className="menu-container">
              <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
                {menuItems.map(item => (
                  <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                    {item.label}
                  </Menu.Item>
                ))}
              </Menu>
              <Button icon={<LogoutOutlined />} onClick={handleLogout} className="logout-button">
                Çıkış Yap
              </Button>
            </div>
          )}
        </Header>
        <Content>
          {children}
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Cars ©{new Date().getFullYear()} 
        </Footer>
      </AntLayout>
    </AntLayout>
  );
}

export default Layout;
