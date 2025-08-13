import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Breadcrumb, Layout } from 'antd';

import menuItems from '@data/menuItems';
import Header from '@layout/Header';
import Sidebar from '@layout/Sidebar';
import Footer from '@layout/Footer';

import MainRoutes from '@router/routes/MainRoute';
import PopupRoutes from '@router/routes/PopupRoute';
import Login from '@pages/Login';

import './App.css';

const { Content } = Layout;
const TITLE_MAP: { [key: string]: string } = {
  lms: 'LMS',
  kjo: 'KJO',
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPopup = location.pathname.startsWith('/popup');
  const isLogin = location.pathname.startsWith('/login');
  const [selectedKey, setSelectedKey] = useState<string>('home');

  const breadcrumbItems = useMemo(() => {
    const pathSnippets = location.pathname.split('/').filter(Boolean);
    return [
      { title: 'Home', path: '/' },
      ...pathSnippets.map((snippet, index) => ({
        title: TITLE_MAP[snippet] || snippet.toUpperCase(),
        path: `/${pathSnippets.slice(0, index + 1).join('/')}`,
      })),
    ];
  }, [location.pathname]);

  if (isPopup) return <PopupRoutes />;

  if (isLogin) return <Login />;

  return (
    <Layout style={{ height: '100vh' }}>
      <Header />
      <Layout style={{ flex: 1 }}>
        <Sidebar selectedKey={selectedKey} setSelectedKey={setSelectedKey} items={menuItems} />
        <Layout className='layoutContent'>
          <Breadcrumb
            items={breadcrumbItems.map((item) => ({
              title: item.title,
              href: item.path,
            }))}
            style={{ margin: '16px 0' }}
          />
          <Content className='contentStyle'>
            <MainRoutes />
          </Content>
        </Layout>
      </Layout>
      <Footer />
    </Layout>
  );
};

export default App;
