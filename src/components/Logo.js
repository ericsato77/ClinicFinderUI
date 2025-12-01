import React from 'react';
import { MedicineBoxOutlined } from '@ant-design/icons';
import '../App.css'; // Assuming styles are here

const Logo = () => (
    <div className="logo-container">
        <div className="logo-icon">
            <MedicineBoxOutlined style={{ fontSize: '24px', color: '#fff' }} />
        </div>
        <span className="logo-text">Clinic Finder</span>
    </div>
);

export default Logo;
