import React, { useState } from 'react';
import {
    Layout, Row, Col, Input, Select, Checkbox, Slider,
    Switch, Rate, Card, List, Tag, Button, Typography,
    Space, Drawer, FloatButton, Badge, Divider
} from 'antd';
import {
    SearchOutlined, EnvironmentOutlined, FilterOutlined,
    ClockCircleOutlined, PhoneOutlined, CompassOutlined
} from '@ant-design/icons';
import { useClinics } from '../hooks/useClinics';
import { serviceOptions } from '../data/clinics';

const { Content } = Layout;
const { Title, Text } = Typography;

const SearchPage = () => {
    const { clinics, filters, updateFilter } = useClinics();
    const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);

    // Filter Panel Component
    const FilterPanel = () => (
        <div style={{ padding: '16px' }}>
            <Title level={4}>Filters</Title>

            <div style={{ marginBottom: '24px' }}>
                <Text strong>Location</Text>
                <Input
                    prefix={<EnvironmentOutlined />}
                    placeholder="Current Location or Zip"
                    style={{ marginTop: '8px' }}
                    onChange={(e) => updateFilter('searchQuery', e.target.value)}
                />
            </div>

            <div style={{ marginBottom: '24px' }}>
                <Text strong>Distance: {filters.distance} miles</Text>
                <Slider
                    min={1}
                    max={50}
                    value={filters.distance}
                    onChange={(val) => updateFilter('distance', val)}
                />
            </div>

            <div style={{ marginBottom: '24px' }}>
                <Text strong>Services</Text>
                <div style={{ marginTop: '8px' }}>
                    <Checkbox.Group
                        options={serviceOptions}
                        value={filters.services}
                        onChange={(vals) => updateFilter('services', vals)}
                        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                        <Switch
                            checked={filters.openNow}
                            onChange={(checked) => updateFilter('openNow', checked)}
                        />
                        <Text>Open Now</Text>
                    </Space>
                    <Space>
                        <Switch
                            checked={filters.insurance}
                            onChange={(checked) => updateFilter('insurance', checked)}
                        />
                        <Text>Accepts Insurance</Text>
                    </Space>
                </Space>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <Text strong>Minimum Rating</Text>
                <div style={{ marginTop: '8px' }}>
                    <Rate
                        allowHalf
                        value={filters.minRating}
                        onChange={(val) => updateFilter('minRating', val)}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            {/* Mobile Filter Drawer */}
            <Drawer
                title="Filters"
                placement="left"
                onClose={() => setMobileFiltersVisible(false)}
                open={mobileFiltersVisible}
                width={300}
            >
                <FilterPanel />
            </Drawer>

            <Content style={{ padding: '24px' }}>
                <Row gutter={[24, 24]}>
                    {/* Desktop Sidebar Filters */}
                    <Col xs={0} md={0} lg={6} xl={5}>
                        <Card bordered={false} style={{ height: '100%', overflowY: 'auto' }}>
                            <FilterPanel />
                        </Card>
                    </Col>

                    {/* Main Content Area */}
                    <Col xs={24} md={24} lg={18} xl={19}>
                        <Row gutter={[16, 16]} style={{ marginBottom: '16px', alignItems: 'center' }}>
                            <Col flex="auto">
                                <Input.Search
                                    placeholder="Search clinics, doctors, or specialties..."
                                    size="large"
                                    enterButton={<Button type="primary" icon={<SearchOutlined />}>Search</Button>}
                                    onSearch={(val) => updateFilter('searchQuery', val)}
                                />
                            </Col>
                            <Col flex="none" xs={24} md={0}>
                                <Button
                                    icon={<FilterOutlined />}
                                    onClick={() => setMobileFiltersVisible(true)}
                                    block
                                >
                                    Filters
                                </Button>
                            </Col>
                        </Row>

                        <Row gutter={[24, 24]}>
                            {/* Results List */}
                            <Col xs={24} lg={14} xl={14}>
                                <div style={{ marginBottom: '16px' }}>
                                    <Text strong>{clinics.length} results found</Text>
                                </div>
                                <List
                                    grid={{ gutter: 16, column: 1 }}
                                    dataSource={clinics}
                                    renderItem={clinic => (
                                        <List.Item>
                                            <Card
                                                hoverable
                                                actions={[
                                                    <Button type="text" icon={<PhoneOutlined />}>Call</Button>,
                                                    <Button type="primary" ghost icon={<CompassOutlined />}>Directions</Button>
                                                ]}
                                            >
                                                <Row justify="space-between" align="top">
                                                    <Col>
                                                        <Title level={4} style={{ margin: 0 }}>{clinic.name}</Title>
                                                        <Space size="small" style={{ marginTop: 4 }}>
                                                            <Rate disabled defaultValue={clinic.rating} style={{ fontSize: 14 }} />
                                                            <Text type="secondary">({clinic.reviewCount})</Text>
                                                        </Space>
                                                    </Col>
                                                    <Col>
                                                        <Badge
                                                            status={clinic.isOpen ? "success" : "default"}
                                                            text={clinic.isOpen ? "Open" : "Closed"}
                                                        />
                                                    </Col>
                                                </Row>

                                                <Divider style={{ margin: '12px 0' }} />

                                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                    <Space>
                                                        <EnvironmentOutlined style={{ color: '#1890ff' }} />
                                                        <Text>{clinic.address}</Text>
                                                        <Text type="secondary">({clinic.distance} mi)</Text>
                                                    </Space>
                                                    <Space>
                                                        <ClockCircleOutlined style={{ color: '#52c41a' }} />
                                                        <Text>{clinic.hours}</Text>
                                                    </Space>
                                                    <div style={{ marginTop: 8 }}>
                                                        {clinic.services.map(service => (
                                                            <Tag key={service} color="blue">{service}</Tag>
                                                        ))}
                                                    </div>
                                                </Space>
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            </Col>

                            {/* Map View (Desktop) */}
                            <Col xs={0} lg={10} xl={10}>
                                <Card
                                    style={{
                                        height: 'calc(100vh - 150px)',
                                        position: 'sticky',
                                        top: 24,
                                        background: '#e6f7ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <div style={{ textAlign: 'center' }}>
                                        <EnvironmentOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                                        <Title level={4} style={{ marginTop: 16 }}>Interactive Map</Title>
                                        <Text type="secondary">Map integration placeholder</Text>
                                        <div style={{ marginTop: 16 }}>
                                            {clinics.map(c => (
                                                <div key={c.id} style={{ fontSize: 10, color: '#666' }}>
                                                    📍 {c.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Content>

            {/* Mobile Map Toggle (Float Button) */}
            <FloatButton
                icon={<EnvironmentOutlined />}
                type="primary"
                style={{ right: 24, bottom: 24 }}
                onClick={() => { /* Toggle map modal or view */ }}
                tooltip="View Map"
            />
        </Layout>
    );
};

export default SearchPage;
