import './App.css';
import './index.css';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Breadcrumb, Layout, theme } from 'antd';
import { useState } from 'react';
import menuItems from '@data/menuItems.jsx';
import Header from '@component/layout/Header';
import Sidebar from '@component/layout/Sidebar';
import Footer from '@component/layout/Footer';
import Home from '@pages/Home';
import Lms from '@pages/Lms';
import Kjo from '@pages/Kjo';
import LmsPop from '@pages/LmsPop.jsx';
import LmsHeader from '@pages/LmsHeader.jsx';
import KjoPop from './pages/KjoPop.jsx';
import KjoHeaderPopup from "@pages/kjoHeaderPopup.jsx";

const { Content } = Layout;

const App = () => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState('home');
  const location = useLocation();
  const isPopup = location.pathname.startsWith('/popup');

  if (isPopup) {
    return (
      <Routes>
        <Route path="/popup/lms_pop" element={<LmsPop />} />
        <Route path="/popup/lms_Header" element={<LmsHeader />} />
        <Route path="/popup/kjo_pop" element={<KjoPop />} />
        <Route path="/popup/kjo_header_pop" element={<KjoHeaderPopup />} />
      </Routes>
    );
  }

  const pathSnippets = location.pathname.split('/').filter((i) => i);
  const breadcrumbItems = [
    { title: 'Home', path: '/' },
    ...pathSnippets.map((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      // 경로 조각에 따른 타이틀 설정
      const titles = {
        lms: 'LMS',
        kjo: 'KJO',
      };
      return {
        title: titles[snippet] || snippet.toUpperCase(),
        path: url,
      };
    }),
  ];
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ height: '100vh' }}>
      <Header />
      <Layout style={{ flex: 1 }}>
        <Sidebar selectedKey={selectedKey} setSelectedKey={setSelectedKey} navigate={navigate} items={menuItems} />
        <Layout
          style={{
            padding: '0 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Breadcrumb
            items={breadcrumbItems.map((item) => ({
              title: item.title,
              href: item.path,
            }))}
            style={{ margin: '16px 0' }}
          />
          <Content
            style={{
              flex: 1,
              margin: 0,
              overflow: 'auto',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              padding: 2,
            }}
          >
            <Routes>
              <Route path="/" element={<Home key={location.key} />} />
              <Route path="/lms" element={<Lms key={location.key} />} />
              <Route path="/kjo" element={<Kjo key={location.key} />} />
              <Route path="*" element={<Home key={location.key} />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
      <Footer />
    </Layout>
  );
};

export default App;
