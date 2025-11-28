import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SearchPage from './pages/Search';
import { ConfigProvider } from 'antd';
import './App.css';

// Placeholder for Home Page
const Home = () => (
  <div style={{ textAlign: 'center', padding: 50 }}>
    <h1>Clinic Finder Home</h1>
    <a href="/search">Go to Search</a>
  </div>
);

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
