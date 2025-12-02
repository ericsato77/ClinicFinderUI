import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layout, Row, Col, Input, Select,
    Switch, Card, List, Tag, Button, Typography,
    Space, Drawer, FloatButton, Badge, Divider, Modal, Spin, Alert, message, Slider
} from 'antd';
import {
    SearchOutlined, EnvironmentOutlined, FilterOutlined,
    CompassOutlined, LoadingOutlined
} from '@ant-design/icons';
import { useClinics, regionOptions } from '../hooks/useClinics';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// Custom marker icons
const createIcon = (color, emoji) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 18px;">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const facilityIcons = {
  hospital: createIcon('#dc2626', '🏥'),
  clinic: createIcon('#2563eb', '🩺'),
  pharmacy: createIcon('#16a34a', '💊'),
  dentist: createIcon('#9333ea', '🦷'),
  doctors: createIcon('#ea580c', '👨‍⚕️'),
  default: createIcon('#6b7280', '📍'),
};

// User location marker icon
const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 0 2px #3b82f6, 0 2px 8px rgba(0,0,0,0.3);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// Component to fit map bounds to markers
function FitBounds({ facilities, userLocation }) {
  const map = useMap();
  
  useEffect(() => {
    if (facilities && facilities.length > 0) {
      const validFacilities = facilities.filter(f => f.latitude && f.longitude);
      if (validFacilities.length > 0) {
        const bounds = validFacilities.map(f => [f.latitude, f.longitude]);
        
        // Include user location in bounds if available
        if (userLocation && userLocation.lat && userLocation.lng) {
          bounds.push([userLocation.lat, userLocation.lng]);
        }
        
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else if (userLocation && userLocation.lat && userLocation.lng) {
      // If no facilities but user location is available, center on user
      map.setView([userLocation.lat, userLocation.lng], 10);
    }
  }, [facilities, userLocation, map]);
  
  return null;
}

const SearchPage = () => {
    const navigate = useNavigate();
    const { 
        clinics, 
        facilities, 
        districts, 
        amenityTypes, 
        filters, 
        updateFilter, 
        clearFilters, 
        loading, 
        error,
        refetchWithLocation 
    } = useClinics();
    
    const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
    const [mobileMapVisible, setMobileMapVisible] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(false);

    // Get user location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            setGettingLocation(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setGettingLocation(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setGettingLocation(false);
                    // Default to Malawi center if geolocation fails
                    setUserLocation({ lat: -13.96, lng: 33.78 });
                }
            );
        } else {
            // Default to Malawi center if geolocation not supported
            setUserLocation({ lat: -13.96, lng: 33.78 });
        }
    }, []);

    // Refetch facilities when distance filter is toggled and user location is available
    useEffect(() => {
        if (userLocation && filters.useDistance) {
            refetchWithLocation(userLocation.lat, userLocation.lng);
        }
    }, [userLocation, filters.useDistance, filters.distance, refetchWithLocation]);

    const handleGetDirections = (clinic) => {
        if (!userLocation) {
            message.warning('Getting your location...');
            return;
        }
        
        navigate('/directions', {
            state: {
                facility: clinic,
                userLocation: userLocation,
            },
        });
    };

    const handleMarkerClick = (facilityId) => {
        const facility = facilities.find(f => f.id === facilityId);
        setSelectedFacility(facility);
    };

    // Filter Panel Component
    const FilterPanel = () => (
        <div style={{ padding: '16px' }}>
            <Title level={4}>Filters</Title>

            <div style={{ marginBottom: '24px' }}>
                <Text strong>Search by Name</Text>
                <Input
                    prefix={<SearchOutlined />}
                    placeholder="Facility name..."
                    style={{ marginTop: '8px' }}
                    value={filters.searchQuery}
                    onChange={(e) => updateFilter('searchQuery', e.target.value)}
                    allowClear
                />
            </div>

            <div style={{ marginBottom: '24px' }}>
                <Text strong>Region</Text>
                <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    placeholder="Select region"
                    value={filters.region || undefined}
                    onChange={(val) => updateFilter('region', val)}
                    allowClear
                >
                    {regionOptions.map(region => (
                        <Option key={region} value={region}>{region}</Option>
                    ))}
                </Select>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <Text strong>District</Text>
                <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    placeholder="Select district"
                    value={filters.district || undefined}
                    onChange={(val) => updateFilter('district', val)}
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {districts.map(d => (
                        <Option key={d.district} value={d.district}>
                            {d.district} ({d.count})
                        </Option>
                    ))}
                </Select>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <Text strong>Facility Type</Text>
                <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    placeholder="Select type"
                    value={filters.amenity || undefined}
                    onChange={(val) => updateFilter('amenity', val)}
                    allowClear
                >
                    {amenityTypes.map(type => (
                        <Option key={type.amenity} value={type.amenity}>
                            {type.amenity.charAt(0).toUpperCase() + type.amenity.slice(1)} ({type.count})
                        </Option>
                    ))}
                </Select>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <Space orientation="vertical" style={{ width: '100%' }}>
                    <Space>
                        <Switch
                            checked={filters.emergency === 'yes'}
                            onChange={(checked) => updateFilter('emergency', checked ? 'yes' : '')}
                        />
                        <Text>Emergency Services</Text>
                    </Space>
                    <Space>
                        <Switch
                            checked={filters.wheelchair === 'yes'}
                            onChange={(checked) => updateFilter('wheelchair', checked ? 'yes' : '')}
                        />
                        <Text>Wheelchair Accessible</Text>
                    </Space>
                </Space>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ marginBottom: '24px' }}>
                <Space orientation="vertical" style={{ width: '100%', marginBottom: '16px' }}>
                    <Space>
                        <Switch
                            checked={filters.useDistance}
                            onChange={(checked) => updateFilter('useDistance', checked)}
                        />
                        <Text strong>Filter by Distance</Text>
                    </Space>
                    {!userLocation && filters.useDistance && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            📍 Getting your location...
                        </Text>
                    )}
                </Space>
                
                {filters.useDistance && (
                    <div style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Within {filters.distance} km
                        </Text>
                        <Slider
                            min={1}
                            max={200}
                            value={filters.distance}
                            onChange={(val) => updateFilter('distance', val)}
                            marks={{
                                1: '1km',
                                50: '50km',
                                100: '100km',
                                200: '200km'
                            }}
                            tooltip={{ formatter: (val) => `${val} km` }}
                        />
                    </div>
                )}
            </div>

            <Button 
                block 
                onClick={clearFilters}
                style={{ marginTop: '16px' }}
            >
                Clear All Filters
            </Button>
        </div>
    );

    const MapContent = () => {
        const getIcon = (amenity) => {
            return facilityIcons[amenity] || facilityIcons.default;
        };

        if (loading) {
            return (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Spin size="large" indicator={<LoadingOutlined spin />} />
                </div>
            );
        }

        if (error) {
            return (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}>
                    <Alert
                        message="Error Loading Map"
                        description={error}
                        type="error"
                        showIcon
                    />
                </div>
            );
        }

        return (
            <div style={{ height: '100%', width: '100%' }}>
                <MapContainer
                    center={[-13.96, 33.78]}
                    zoom={7}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* User Location Marker */}
                    {userLocation && userLocation.lat && userLocation.lng && (
                        <Marker
                            position={[userLocation.lat, userLocation.lng]}
                            icon={userLocationIcon}
                        >
                            <Popup>
                                <div style={{ minWidth: '150px', textAlign: 'center' }}>
                                    <strong style={{ fontSize: '14px' }}>📍 Your Location</strong>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                    
                    {/* Facility Markers */}
                    {facilities && facilities.length > 0 && facilities.map((facility) => {
                        if (!facility.latitude || !facility.longitude) return null;
                        
                        return (
                            <Marker
                                key={facility.id}
                                position={[facility.latitude, facility.longitude]}
                                icon={getIcon(facility.amenity)}
                                eventHandlers={{
                                    click: () => handleMarkerClick(facility.id),
                                }}
                            >
                                <Popup>
                                    <div style={{ minWidth: '200px' }}>
                                        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                                            {facility.name}
                                        </h3>
                                        <p style={{ margin: '4px 0', fontSize: '13px', color: '#666', textTransform: 'capitalize' }}>
                                            <strong>Type:</strong> {facility.amenity || 'Health Facility'}
                                        </p>
                                        <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                                            <strong>Location:</strong> {facility.district}, {facility.region}
                                        </p>
                                        {facility.emergency === 'yes' && (
                                            <span style={{ display: 'inline-block', padding: '2px 8px', background: '#fee2e2', color: '#dc2626', borderRadius: '12px', fontSize: '11px', marginTop: '8px' }}>
                                                🚨 Emergency Services
                                            </span>
                                        )}
                                        {facility.wheelchair === 'yes' && (
                                            <span style={{ display: 'inline-block', padding: '2px 8px', background: '#dcfce7', color: '#16a34a', borderRadius: '12px', fontSize: '11px', marginTop: '8px', marginLeft: '4px' }}>
                                                ♿ Accessible
                                            </span>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                    
                    {facilities && facilities.length > 0 && <FitBounds facilities={facilities} userLocation={userLocation} />}
                </MapContainer>
            </div>
        );
    };

    return (
        <Layout style={{ flex: 1, background: '#f0f2f5' }}>
            {/* Mobile Filter Drawer */}
            <Drawer
                title="Filters"
                placement="left"
                onClose={() => setMobileFiltersVisible(false)}
                open={mobileFiltersVisible}
                size="default"
            >
                <FilterPanel />
            </Drawer>

            {/* Mobile Map Modal */}
            <Modal
                title="Map View"
                open={mobileMapVisible}
                onCancel={() => setMobileMapVisible(false)}
                footer={null}
                width="90%"
                style={{ top: 20 }}
                bodyStyle={{ height: '70vh', padding: 0 }}
            >
                <MapContent />
            </Modal>

            <Content style={{ padding: '24px' }}>
                <Row gutter={[24, 24]}>
                    {/* Desktop Sidebar Filters */}
                    <Col xs={0} md={0} lg={6} xl={5}>
                        <Card variant="borderless" style={{ height: '100%', overflowY: 'auto' }}>
                            <FilterPanel />
                        </Card>
                    </Col>

                    {/* Main Content Area */}
                    <Col xs={24} md={24} lg={18} xl={19}>
                        <Row gutter={[16, 16]} style={{ marginBottom: '16px', alignItems: 'center' }}>
                            <Col flex="auto">
                                <Input.Search
                                    placeholder="Search facilities by name..."
                                    size="large"
                                    enterButton={<Button type="primary" icon={<SearchOutlined />}>Search</Button>}
                                    value={filters.searchQuery}
                                    onChange={(e) => updateFilter('searchQuery', e.target.value)}
                                    onSearch={(val) => updateFilter('searchQuery', val)}
                                    allowClear
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
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '48px' }}>
                                        <Spin size="large" indicator={<LoadingOutlined spin />} />
                                    </div>
                                ) : error ? (
                                    <Alert
                                        title="Error Loading Facilities"
                                        description={error}
                                        type="error"
                                        showIcon
                                    />
                                ) : (
                                    <List
                                        grid={{ gutter: 16, column: 1 }}
                                        dataSource={clinics}
                                        renderItem={clinic => (
                                            <List.Item>
                                                <Card
                                                    hoverable
                                                    onClick={() => setSelectedFacility(clinic)}
                                                    actions={[
                                                        <Button 
                                                            type="primary" 
                                                            ghost 
                                                            icon={<CompassOutlined />}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleGetDirections(clinic);
                                                            }}
                                                            loading={gettingLocation}
                                                        >
                                                            Directions
                                                        </Button>
                                                    ]}
                                                >
                                                    <Row justify="space-between" align="top">
                                                        <Col>
                                                            <Title level={4} style={{ margin: 0 }}>{clinic.name}</Title>
                                                            <Space size="small" style={{ marginTop: 4 }}>
                                                                <Tag color="blue">
                                                                    {clinic.amenity?.charAt(0).toUpperCase() + clinic.amenity?.slice(1) || 'Facility'}
                                                                </Tag>
                                                            </Space>
                                                        </Col>
                                                        <Col>
                                                            {clinic.emergency === 'yes' && (
                                                                <Badge status="error" text="Emergency" />
                                                            )}
                                                        </Col>
                                                    </Row>

                                                    <Divider style={{ margin: '12px 0' }} />

                                                    <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                                                        <Space>
                                                            <EnvironmentOutlined style={{ color: '#1890ff' }} />
                                                            <Text>{clinic.district}, {clinic.region}</Text>
                                                        </Space>
                                                        {clinic.operator && (
                                                            <Space>
                                                                <Text type="secondary">Operator:</Text>
                                                                <Text>{clinic.operator}</Text>
                                                            </Space>
                                                        )}
                                                        <Space wrap style={{ marginTop: 8 }}>
                                                            {clinic.wheelchair === 'yes' && (
                                                                <Tag color="green">♿ Wheelchair Accessible</Tag>
                                                            )}
                                                            {clinic.beds && (
                                                                <Tag color="purple">🛏️ {clinic.beds} beds</Tag>
                                                            )}
                                                        </Space>
                                                    </Space>
                                                </Card>
                                            </List.Item>
                                        )}
                                    />
                                )}
                            </Col>

                            {/* Map View (Desktop) */}
                            <Col xs={0} lg={10} xl={10}>
                                <Card
                                    bodyStyle={{ padding: 0, height: '100%' }}
                                    style={{
                                        height: 'calc(100vh - 150px)',
                                        position: 'sticky',
                                        top: 24,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <MapContent />
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
                onClick={() => setMobileMapVisible(true)}
                tooltip="View Map"
            />
        </Layout>
    );
};

export default SearchPage;
