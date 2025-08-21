import React from 'react';
import { useState, useMemo } from 'react';
import {useNavigate, useLocation, Navigate, Outlet, Routes, Route} from 'react-router-dom';

import { Breadcrumb, Layout } from 'antd';
import menuItems from '@data/menuItems';
import Header from '@layout/Header';
import Sidebar from '@layout/Sidebar';

import Footer from '@layout/Footer';
import MainRoutes from '@router/routes/MainRoute';

import PopupRoutes from '@router/routes/PopupRoute';
import './App.css';
import MainRoute from "@router/routes/MainRoute";
import Login from "@pages/Login";
import Signup from "@pages/Signup";

const { Content } = Layout;
const TITLE_MAP: { [key: string]: string } = {
  lms: 'LMS',
  kjo: 'KJO',
};

function PrivateRoute() {
  const isLoggedIn = Boolean(localStorage.getItem('accessToken')); // 로그인 체크 예시

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPopup = location.pathname.startsWith('/popup');
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

  // 로그인, 회원가입 페이지는 레이아웃 없이 렌더링
  if (location.pathname === '/login') return <Login />;
  if (location.pathname === '/signup') return <Signup />;

  return (
      <div>
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
      </div>
  );
};

export default App;
