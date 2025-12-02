import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layout, Card, Button, Space, Typography, Spin, Alert, Steps, Divider } from 'antd';
import { 
    ArrowLeftOutlined, 
    EnvironmentOutlined, 
    ClockCircleOutlined,
    CarOutlined 
} from '@ant-design/icons';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const { Content } = Layout;
const { Title, Text } = Typography;

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom icons
const startIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="background-color: #16a34a; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 20px;">📍</div>',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const endIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="background-color: #dc2626; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 20px;">🏥</div>',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Component to fit map to route bounds
function FitBounds({ route }) {
  const map = useMap();
  
  useEffect(() => {
    if (route && route.length > 0) {
      const bounds = L.latLngBounds(route);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, map]);
  
  return null;
}

export default function DirectionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { facility, userLocation } = location.state || {};
  
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    if (!facility || !userLocation) {
      setError('Missing location information');
      setLoading(false);
      return;
    }

    // Fetch route from OSRM (OpenStreetMap Routing Machine)
    const fetchRoute = async () => {
      try {
        const start = `${userLocation.lng},${userLocation.lat}`;
        const end = `${facility.longitude},${facility.latitude}`;
        
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson&steps=true`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch route');
        }
        
        const data = await response.json();
        
        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
          throw new Error('No route found');
        }
        
        const routeData = data.routes[0];
        const coordinates = routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        setRoute(coordinates);
        setRouteInfo({
          distance: (routeData.distance / 1000).toFixed(2), // km
          duration: Math.round(routeData.duration / 60), // minutes
          steps: routeData.legs[0].steps.map((step, index) => ({
            key: index,
            instruction: step.maneuver.instruction || getManeuverInstruction(step.maneuver),
            distance: (step.distance / 1000).toFixed(2),
            duration: Math.round(step.duration / 60),
          })),
        });
        
      } catch (err) {
        console.error('Error fetching route:', err);
        setError('Unable to calculate route. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [facility, userLocation]);

  const getManeuverInstruction = (maneuver) => {
    const type = maneuver.type;
    const modifier = maneuver.modifier;
    
    const instructions = {
      turn: `Turn ${modifier}`,
      'new name': 'Continue on road',
      depart: 'Depart',
      arrive: 'Arrive at destination',
      merge: 'Merge',
      'on ramp': 'Take the ramp',
      'off ramp': 'Take the exit',
      fork: `Take the ${modifier} fork`,
      'end of road': `At the end of the road, turn ${modifier}`,
      continue: 'Continue straight',
      roundabout: 'Enter the roundabout',
      rotary: 'Enter the rotary',
    };
    
    return instructions[type] || 'Continue';
  };

  if (!facility || !userLocation) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '24px' }}>
          <Card>
            <Alert
              message="Missing Information"
              description="Unable to load directions. Please go back and try again."
              type="error"
              showIcon
              action={
                <Button onClick={() => navigate('/search')}>
                  Back to Search
                </Button>
              }
            />
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <Card>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)}
                type="text"
              >
                Back
              </Button>
              <Title level={3} style={{ margin: 0 }}>
                Directions to {facility.name}
              </Title>
              <Space>
                <EnvironmentOutlined style={{ color: '#1890ff' }} />
                <Text type="secondary">{facility.district}, {facility.region}</Text>
              </Space>
              
              {routeInfo && !loading && !error && (
                <>
                  <Divider style={{ margin: '12px 0' }} />
                  <Space size="large">
                    <Space>
                      <CarOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                      <Text strong>{routeInfo.distance} km</Text>
                    </Space>
                    <Space>
                      <ClockCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                      <Text strong>{routeInfo.duration} min</Text>
                    </Space>
                  </Space>
                </>
              )}
            </Space>
          </Card>

          {/* Map */}
          <Card bodyStyle={{ padding: 0, height: '400px' }} style={{ height: '400px', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ 
                height: '400px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Spin size="large" tip="Calculating route..." />
              </div>
            ) : error ? (
              <div style={{ 
                height: '400px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '24px'
              }}>
                <Alert message="Route Error" description={error} type="error" showIcon />
              </div>
            ) : (
              <div style={{ height: '400px', width: '100%' }}>
                <MapContainer
                  center={[userLocation.lat, userLocation.lng]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Start Location Marker */}
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={startIcon}>
                    <Popup>
                      <strong>Your Location</strong>
                    </Popup>
                  </Marker>
                  
                  {/* End Location Marker */}
                  <Marker position={[facility.latitude, facility.longitude]} icon={endIcon}>
                    <Popup>
                      <strong>{facility.name}</strong>
                      <br />
                      {facility.amenity}
                    </Popup>
                  </Marker>
                  
                  {/* Route Line */}
                  {route && (
                    <>
                      <Polyline 
                        positions={route} 
                        color="#1890ff" 
                        weight={5}
                        opacity={0.7}
                      />
                      <FitBounds route={route} />
                    </>
                  )}
                </MapContainer>
              </div>
            )}
          </Card>


        </Space>
      </Content>
    </Layout>
  );
}
