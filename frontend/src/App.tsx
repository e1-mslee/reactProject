import { useState, useMemo, useEffect } from 'react';
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
  const isRoot = location.pathname === '/';

  const [selectedKey, setSelectedKey] = useState<string>('home');

  // 인증 체크 및 루트 경로 처리
  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    // 루트 경로(/)로 접근시 로그인 페이지로 리다이렉트
    if (isRoot) {
      void navigate('/login', { replace: true });
      return;
    }

    // 로그인 페이지나 팝업이 아니면서 토큰이 없는 경우 로그인으로 리다이렉트
    if (!isLogin && !isPopup && !token) {
      void navigate('/login', { replace: true });
    }
  }, [location.pathname, navigate, isRoot, isLogin, isPopup]);

  const breadcrumbItems = useMemo(() => {
    const pathSnippets = location.pathname.split('/').filter(Boolean);
    return [
      { title: 'Home', path: '/home' },
      ...pathSnippets.map((snippet, index) => ({
        title: TITLE_MAP[snippet] || snippet.toUpperCase(),
        path: `/${pathSnippets.slice(0, index + 1).join('/')}`,
      })),
    ];
  }, [location.pathname]);

  // 팝업 경로인 경우
  if (isPopup) return <PopupRoutes />;

  // 로그인 경로인 경우
  if (isLogin) return <Login />;

  // 루트 경로인 경우 (리다이렉트 중이므로 빈 화면 또는 로딩)
  if (isRoot) return null;

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
