import React, { useState } from 'react';
import axios from '../axiosConfig';
import { Form, Input, Button, Alert } from 'antd';

function Login({ onLogin }) {
  const [error, setError] = useState('');

  const onFinish = (values) => {
    axios.post('/auth/login', values)
      .then(() => {
        onLogin();
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Giriş yaparken bir hata oluştu.');
      });
  };

  return (
    <div style={{ maxWidth: '300px', margin: '100px auto' }}>
      <h2>Giriş Yap</h2>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '20px' }} />}
      <Form onFinish={onFinish}>
        <Form.Item name="username" rules={[{ required: true, message: 'Lütfen kullanıcı adınızı girin!' }]}>
          <Input placeholder="Kullanıcı Adı" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: 'Lütfen şifrenizi girin!' }]}>
          <Input.Password placeholder="Şifre" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>Giriş Yap</Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Login;
