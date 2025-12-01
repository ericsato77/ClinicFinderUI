import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import SearchPage from './pages/Search';
import MainLayout from './components/MainLayout';
import { ConfigProvider, Typography, Button, Row, Col, Card, Space, theme } from 'antd';
import { MedicineBoxOutlined, SearchOutlined, EnvironmentOutlined, SafetyCertificateOutlined, ArrowRightOutlined } from '@ant-design/icons';
import './App.css';

const { Title, Text, Paragraph } = Typography;

// --- Components ---

const FeatureCard = ({ icon, title, description }) => {
  const { token } = theme.useToken();
  return (
    <Card
      className="feature-card"
      bordered={false}
      style={{ background: token.colorBgContainer, height: '100%' }}
    >
      <div className="feature-icon" style={{ color: token.colorPrimary }}>
        {icon}
      </div>
      <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>{title}</Title>
      <Paragraph type="secondary">{description}</Paragraph>
    </Card>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { token } = theme.useToken();

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <div className="hero-content">
                <Title level={1} className="hero-title">
                  Your Health, <br />
                  <span style={{ color: token.colorPrimary }}>Our Priority.</span>
                </Title>
                <Paragraph className="hero-subtitle">
                  Find the best clinics and doctors near you instantly.
                  Book appointments, read reviews, and get the care you deserve.
                </Paragraph>
                <Space size="middle">
                  <Button type="primary" size="large" shape="round" icon={<SearchOutlined />} onClick={() => navigate('/search')}>
                    Start Searching
                  </Button>

                </Space>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="hero-image-placeholder">
                {/* Abstract visual representation */}
                <div className="floating-card card-1">
                  <SafetyCertificateOutlined style={{ fontSize: '24px', color: token.colorPrimary }} />
                  <div>
                    <Text strong>Verified Clinics</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>100% Trusted</Text>
                  </div>
                </div>
                <div className="floating-card card-2">
                  <EnvironmentOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                  <div>
                    <Text strong>Near You</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>GPS Enabled</Text>
                  </div>
                </div>
                <div className="hero-circle"></div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Title level={2}>Why Choose Clinic Finder?</Title>
            <Text type="secondary">We make healthcare accessible and hassle-free.</Text>
          </div>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <FeatureCard
                icon={<SearchOutlined style={{ fontSize: '32px' }} />}
                title="Easy Search"
                description="Find clinics by specialty, location, or name with our advanced search filters."
              />
            </Col>
            <Col xs={24} md={8}>
              <FeatureCard
                icon={<EnvironmentOutlined style={{ fontSize: '32px' }} />}
                title="Location Based"
                description="Get directions to the nearest clinics and see them on an interactive map."
              />
            </Col>
            <Col xs={24} md={8}>
              <FeatureCard
                icon={<SafetyCertificateOutlined style={{ fontSize: '32px' }} />}
                title="Verified Reviews"
                description="Read genuine reviews from other patients to make informed decisions."
              />
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
        components: {
          Button: {
            controlHeightLG: 50,
            fontSizeLG: 16,
          },
          Layout: {
            headerBg: '#ffffff',
            bodyBg: '#ffffff',
          }
        }
      }}
    >
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
