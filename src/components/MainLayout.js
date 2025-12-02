import React from 'react';
import { Layout, Button, theme } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import Logo from './Logo';

const { Header, Content, Footer } = Layout;

const MainLayout = () => {
    const navigate = useNavigate();
    const { token } = theme.useToken();

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Header className="header">
                <div className="container header-content">
                    <Logo />

                </div>
            </Header>

            <Content style={{ display: 'flex', flexDirection: 'column' }}>
                <Outlet />
            </Content>

            <Footer style={{ textAlign: 'center', background: '#fff' }}>
                Clinic Finder ©2025
            </Footer>
        </Layout>
    );
};

export default MainLayout;
