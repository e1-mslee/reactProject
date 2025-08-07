import './App.css';
import './index.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { Breadcrumb, Layout, theme } from 'antd';
import { useState } from 'react';
import menuItems from '@data/menuItems';
import Header from '@component/layout/Header';
import Sidebar from '@component/layout/Sidebar';
import Footer from '@component/layout/Footer';
import MainRoutes from '@router/routes/MainRoute';
import PopupRoutes from '@router/routes/PopupRoute';

const { Content } = Layout;

interface BreadcrumbItem {
  title: string;
  path: string;
}

interface TitleMap {
  [key: string]: string;
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState<string>('home');
  const location = useLocation();
  const isPopup = location.pathname.startsWith('/popup');

  if (isPopup) {
    return <PopupRoutes />;
  }

  const pathSnippets = location.pathname.split('/').filter((i) => i);
  const breadcrumbItems: BreadcrumbItem[] = [
    { title: 'Home', path: '/' },
    ...pathSnippets.map((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const titles: TitleMap = {
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
            <MainRoutes />
          </Content>
        </Layout>
      </Layout>
      <Footer />
    </Layout>
  );
};

export default App;
