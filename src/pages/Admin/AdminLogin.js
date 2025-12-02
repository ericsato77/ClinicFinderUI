import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { MedicineBoxOutlined } from '@ant-design/icons';
import { adminService } from '../../services/adminService';
import '../../styles/admin.css';

const { Title, Text } = Typography;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const { username, password } = values;
    
    try {
      setLoading(true);
      console.log('Attempting login with:', { username, password: '***' });
      const result = await adminService.login(username, password);
      console.log('Login successful:', result);
      message.success('Login successful!');
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.message || error.response?.data?.error || 'Login failed. Please check your credentials.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <Card className="admin-card">
        <div className="login-brand">
          <div className="logo-icon"><MedicineBoxOutlined /></div>
          <div>
            <div className="logo-title">Clinic Finder Admin</div>
            <div className="login-subtitle">Manage clinics, users and activity logs</div>
          </div>
        </div>

        <Title level={4} style={{ textAlign: 'center', marginBottom: 8 }}>Sign in to your admin account</Title>

        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ username: 'admin' }}>
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Enter username' }]}>
            <Input placeholder="admin" />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Enter password' }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <div className="login-helper">
            <div></div>
            <div className="forgot-link" onClick={() => message.info('Reset flow not implemented')}>Forgot?</div>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <Text type="secondary">Signed in actions are logged for auditing.</Text>
        </div>
      </Card>
    </div>
  );
}