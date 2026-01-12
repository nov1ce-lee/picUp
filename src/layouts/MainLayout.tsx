import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { UploadOutlined, HistoryOutlined, SettingOutlined } from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UploadPage from '../pages/Upload.tsx';
import HistoryPage from '../pages/History.tsx';
import SettingsPage from '../pages/Settings.tsx';

const { Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/' || path === '/upload') return '1';
    if (path === '/history') return '2';
    if (path === '/settings') return '3';
    return '1';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', color: '#fff', lineHeight: '32px', fontWeight: 'bold' }}>
          {collapsed ? 'PU' : 'PicUp'}
        </div>
        <Menu theme="dark" selectedKeys={[getSelectedKey()]} mode="inline" items={[
          {
            key: '1',
            icon: <UploadOutlined />,
            label: t('upload'),
            onClick: () => navigate('/')
          },
          {
            key: '2',
            icon: <HistoryOutlined />,
            label: t('history'),
            onClick: () => navigate('/history')
          },
          {
            key: '3',
            icon: <SettingOutlined />,
            label: t('settings'),
            onClick: () => navigate('/settings')
          }
        ]} />
      </Sider>
      <Layout>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px', height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<UploadPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
