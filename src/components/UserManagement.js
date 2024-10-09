import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Table, Button, Modal, Form, Input, message } from 'antd';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios
      .get('/users')
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error('Kullanıcılar alınırken hata:', err);
      });
  };

  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      axios
        .post('/users', values)
        .then(() => {
          message.success('Kullanıcı başarıyla oluşturuldu.');
          setIsModalVisible(false);
          fetchUsers();
        })
        .catch((err) => {
          message.error(err.response?.data?.message || 'Kullanıcı oluşturulurken bir hata oluştu.');
        });
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const deleteUser = (id) => {
    axios
      .delete(`/users/${id}`)
      .then(() => {
        message.success('Kullanıcı başarıyla silindi.');
        fetchUsers();
      })
      .catch((err) => {
        message.error(err.response?.data?.message || 'Kullanıcı silinirken bir hata oluştu.');
      });
  };

  const columns = [
    {
      title: 'Kullanıcı Adı',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (text, record) => (
        <Button type="link" onClick={() => deleteUser(record._id)}>
          Sil
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2>Kullanıcı Yönetimi</h2>
      <Button type="primary" onClick={showModal} style={{ marginBottom: '20px' }}>
        Yeni Kullanıcı Ekle
      </Button>
      <Table dataSource={users} columns={columns} rowKey="_id" />
      <Modal title="Yeni Kullanıcı" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Kullanıcı Adı" rules={[{ required: true, message: 'Lütfen kullanıcı adını girin!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Şifre" rules={[{ required: true, message: 'Lütfen şifreyi girin!' }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserManagement;
