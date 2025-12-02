import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Modal, Input, Tabs, Space, Typography, message } from 'antd';
import { DatabaseOutlined, TeamOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import { adminService } from '../../services/adminService';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const clinicsData = await adminService.getClinics();
      setClinics(clinicsData);
      setActivities(adminService.getActivities());
    } catch (error) {
      message.error('Failed to load facilities: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const user = adminService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleLogout = async () => {
    try {
      await adminService.logout();
      message.success('Logged out successfully');
      navigate('/admin/login');
    } catch (error) {
      message.error('Logout failed');
    }
  };

  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);

  const showDetails = (clinic) => {
    setSelectedClinic(clinic);
    setDetailsVisible(true);
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Type', dataIndex: 'amenity', key: 'amenity', width: 100, render: (val) => val ? val.charAt(0).toUpperCase() + val.slice(1) : 'N/A' },
    { title: 'District', dataIndex: 'district', key: 'district', width: 120 },
    { title: 'Region', dataIndex: 'region', key: 'region', width: 100 },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button size="small" onClick={() => showDetails(record)}>View Details</Button>
      ),
    },
  ];

  return (
    <div className="admin-dashboard-container">
      <div className="admin-card-panel">
        <div className="header-row">
          <div className="header-left">
            <h2>Admin Dashboard</h2>
            <div style={{ color: 'rgba(2,6,23,0.6)', fontSize: 13 }}>
              {currentUser && `Welcome, ${currentUser.username || currentUser.first_name || 'Admin'} • `}
              View health facilities from OpenStreetMap data (Read-only)
            </div>
          </div>
          <div className="header-right">
            <Space>
              <Button onClick={loadData} loading={loading} icon={<DatabaseOutlined />}>Refresh</Button>
              <Button onClick={handleLogout} icon={<LogoutOutlined />}>Logout</Button>
            </Space>
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
            <Input.Search
              className="admin-search"
              placeholder="Search facilities by name, district, or region"
              onSearch={async (val) => {
                if (!val) return loadData();
                const allClinics = await adminService.getClinics();
                const filtered = allClinics.filter(c =>
                  (c.name || '').toLowerCase().includes(val.toLowerCase()) ||
                  (c.district || '').toLowerCase().includes(val.toLowerCase()) ||
                  (c.region || '').toLowerCase().includes(val.toLowerCase())
                );
                setClinics(filtered);
              }}
              allowClear
            />
          </div>
          <div className="right">
            <Button onClick={() => { adminService.logActivity('export_activities'); message?.success?.('Export not implemented'); }}>Export</Button>
          </div>
        </div>

        <Tabs defaultActiveKey="clinics" className="admin-tabs">
          <TabPane tab="Health Facilities" key="clinics">
            <div className="admin-table">
              <Table 
                rowKey="id" 
                dataSource={clinics} 
                columns={columns} 
                pagination={{ pageSize: 10 }} 
                loading={loading}
              />
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

      <Modal 
        title="Facility Details" 
        open={detailsVisible} 
        onCancel={() => setDetailsVisible(false)} 
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>Close</Button>
        ]}
        width={600}
      >
        {selectedClinic && (
          <div style={{ padding: '16px 0' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>Name:</Text> <Text>{selectedClinic.name}</Text>
              </div>
              <div>
                <Text strong>Type:</Text> <Text>{selectedClinic.amenity ? selectedClinic.amenity.charAt(0).toUpperCase() + selectedClinic.amenity.slice(1) : 'N/A'}</Text>
              </div>
              <div>
                <Text strong>District:</Text> <Text>{selectedClinic.district || 'N/A'}</Text>
              </div>
              <div>
                <Text strong>Region:</Text> <Text>{selectedClinic.region || 'N/A'}</Text>
              </div>
              {selectedClinic.operator && (
                <div>
                  <Text strong>Operator:</Text> <Text>{selectedClinic.operator}</Text>
                </div>
              )}
              {selectedClinic.beds && (
                <div>
                  <Text strong>Beds:</Text> <Text>{selectedClinic.beds}</Text>
                </div>
              )}
              <div>
                <Text strong>Emergency Services:</Text> <Text>{selectedClinic.emergency === 'yes' ? 'Yes' : 'No'}</Text>
              </div>
              <div>
                <Text strong>Wheelchair Accessible:</Text> <Text>{selectedClinic.wheelchair === 'yes' ? 'Yes' : 'No'}</Text>
              </div>
              {selectedClinic.latitude && selectedClinic.longitude && (
                <div>
                  <Text strong>Coordinates:</Text> <Text>{selectedClinic.latitude.toFixed(6)}, {selectedClinic.longitude.toFixed(6)}</Text>
                </div>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
}