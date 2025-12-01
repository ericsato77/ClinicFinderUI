import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { adminService } from '../../services/adminService';

const { Title } = Typography;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = (values) => {
    const { username, password } = values;
    // simple hardcoded password check
    if (password !== 'secret123') {
      adminService.logActivity('admin_failed_login', { username });
      message.error('Invalid password');
      return;
    }
    localStorage.setItem('adminAuth', JSON.stringify({ user: username, ts: Date.now() }));
    adminService.logActivity('admin_login', { user: username });
    message.success('Logged in as admin');
    navigate('/admin');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <Card style={{ width: 420 }}>
        <Title level={3}>Admin Login</Title>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ username: 'admin' }}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}