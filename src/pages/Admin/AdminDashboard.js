import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, Tabs, Space, Popconfirm, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DatabaseOutlined, TeamOutlined, HistoryOutlined } from '@ant-design/icons';
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
    <div className="admin-dashboard-container">
      <div className="admin-card-panel">
        <div className="header-row">
          <div className="header-left">
            <h2>Admin Dashboard</h2>
            <div style={{ color: 'rgba(2,6,23,0.6)', fontSize: 13 }}>Manage clinics and review activity logs</div>
          </div>
          <div className="header-right">
            <Button onClick={loadData} icon={<DatabaseOutlined />}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add Clinic</Button>
          </div>
        </div>

        <div className="admin-stats-row" aria-hidden>
          <div className="admin-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg,#1677ff,#69c0ff)' }}><DatabaseOutlined /></div>
            <div className="stat-body">
              <div className="stat-label">Total Clinics</div>
              <div className="stat-value">{clinics.length}</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg,#52c41a,#95de64)' }}><TeamOutlined /></div>
            <div className="stat-body">
              <div className="stat-label">Total Activities</div>
              <div className="stat-value">{activities.length}</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg,#fa8c16,#ffd591)' }}><HistoryOutlined /></div>
            <div className="stat-body">
              <div className="stat-label">Last Activity</div>
              <div className="stat-value">{activities[0] ? new Date(activities[0].timestamp).toLocaleString() : '—'}</div>
            </div>
          </div>
        </div>

        <div className="admin-toolbar">
          <div className="left">
            <Input.Search placeholder="Search clinics by name or address" onSearch={(val) => {
              if (!val) return setClinics(adminService.getClinics());
              const filtered = adminService.getClinics().filter(c => (c.name || '').toLowerCase().includes(val.toLowerCase()) || (c.address || '').toLowerCase().includes(val.toLowerCase()));
              setClinics(filtered);
            }} style={{ width: 360 }} allowClear />
          </div>
          <div className="right">
            <Button onClick={() => { adminService.logActivity('export_activities'); message?.success?.('Export not implemented'); }}>Export</Button>
          </div>
        </div>

        <Tabs defaultActiveKey="clinics" className="admin-tabs">
          <TabPane tab="Clinics" key="clinics">
            <div className="admin-table">
              <Table rowKey="id" dataSource={clinics} columns={columns} pagination={{ pageSize: 8 }} />
            </div>
          </TabPane>

          <TabPane tab="Activity Log" key="activity">
            <div className="activity-log-table">
              <Table
                dataSource={activities}
                rowKey={(r) => r.timestamp}
                pagination={{ pageSize: 10 }}
                columns={[
                  { title: 'Time', dataIndex: 'timestamp', key: 't', render: (ts) => new Date(ts).toLocaleString() },
                  { title: 'Action', dataIndex: 'action', key: 'a' },
                  { title: 'Details', dataIndex: 'details', key: 'd', render: (d) => <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(d)}</pre> },
                ]}
              />
            </div>
          </TabPane>
        </Tabs>
      </div>

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