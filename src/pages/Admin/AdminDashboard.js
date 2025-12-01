import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, Tabs, Space, Popconfirm, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminService } from '../../services/adminService';

const { TabPane } = Tabs;
const { Title } = Typography;

export default function AdminDashboard() {
  const [clinics, setClinics] = useState([]);
  const [activities, setActivities] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const loadData = () => {
    setClinics(adminService.getClinics());
    setActivities(adminService.getActivities());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    form.setFieldsValue(row);
    setModalOpen(true);
  };

  const onDelete = (id) => {
    adminService.deleteClinic(id);
    adminService.logActivity('clinic_deleted', { id });
    loadData();
  };

  const onFinish = (vals) => {
    if (editing) {
      const updated = { ...editing, ...vals };
      adminService.updateClinic(updated);
      adminService.logActivity('clinic_updated', { id: updated.id, name: updated.name });
    } else {
      const newClinic = adminService.addClinic(vals);
      adminService.logActivity('clinic_added', { id: newClinic.id, name: newClinic.name });
    }
    setModalOpen(false);
    loadData();
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 140 },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete clinic?" onConfirm={() => onDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Admin Dashboard</Title>

      <Tabs defaultActiveKey="clinics">
        <TabPane tab="Clinics" key="clinics">
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
              Add Clinic
            </Button>
          </div>
          <Table rowKey="id" dataSource={clinics} columns={columns} />
        </TabPane>

        <TabPane tab="Activity Log" key="activity">
          <Table
            dataSource={activities}
            rowKey={(r) => r.timestamp}
            columns={[
              { title: 'Time', dataIndex: 'timestamp', key: 't', render: (ts) => new Date(ts).toLocaleString() },
              { title: 'Action', dataIndex: 'action', key: 'a' },
              { title: 'Details', dataIndex: 'details', key: 'd', render: (d) => JSON.stringify(d) },
            ]}
          />
        </TabPane>
      </Tabs>

      <Modal title={editing ? 'Edit Clinic' : 'Add Clinic'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Clinic Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="services" label="Services (comma separated)">
            <Input />
          </Form.Item>
          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'end' }}>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">{editing ? 'Update' : 'Add'}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}