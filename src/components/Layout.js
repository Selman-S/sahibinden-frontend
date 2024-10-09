// src/components/Layout.js

import React from 'react';
import { Layout as AntLayout, Menu, Button } from 'antd';
import { LogoutOutlined, UserOutlined, CarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

const { Header, Content, Sider } = AntLayout;

function Layout({ children, userRole, onLogout }) {
  const navigate = useNavigate();

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
  ];

  if (userRole === 'admin') {
    menuItems.push({ key: '2', icon: <UserOutlined />, label: 'Kullanıcı Yönetimi', onClick: () => navigate('/users') });
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider>
        <div className="logo" style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.3)' }} />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <AntLayout>
        <Header style={{ background: '#fff', padding: 0, textAlign: 'right', paddingRight: '20px' }}>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>Çıkış Yap</Button>
        </Header>
        <Content style={{ margin: '16px' }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
}

export default Layout;
