// src/components/Layout.js

import React from 'react';
import { Layout as AntLayout, Menu, Button } from 'antd';
import { LogoutOutlined, UserOutlined, CarOutlined,PaperClipOutlined,OrderedListOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

const { Header, Content,  Footer } = AntLayout;

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
    { key: '2', icon: <PaperClipOutlined />, label: 'Avantajlı Araçlar', onClick: () => navigate('/avantaj') },
    { key: '3', icon: <OrderedListOutlined />, label: 'Tavsiye', onClick: () => navigate('/tavsiye') },
  ];

  if (userRole === 'admin') {
    menuItems.push({ key: '4', icon: <UserOutlined />, label: 'Kullanıcı Yönetimi', onClick: () => navigate('/users') });
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      
      <AntLayout>
        <Header style={{ display:"flex",alignItems:"center", padding: 10,  paddingRight: '20px'}}>
        <div className="logo" style={{padding:10,display:"flex"}} > <img  width={164} src="./carlogo.png"/> </div>
        <div  style={{ display:"flex",alignItems:"center", width:"100%",  justifyContent:"space-between"}}>

        <Menu theme="dark"  mode="horizontal" defaultSelectedKeys={['1']}>
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>Çıkış Yap</Button>
          </div>
        </Header>
        <Content style={{ margin: '16px' }}>
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
