import './App.css'
import './index.css';
import { Routes, Route,useNavigate,useLocation } from 'react-router-dom';
import { Breadcrumb, Layout, theme } from 'antd';
import { useState } from 'react';
import menuItems from './data/menuItems.jsx';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Lms from './pages/Lms';
import Kjo from './pages/Kjo';

const {Content } = Layout;

const App = () => {

  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState('home');
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);
  const breadcrumbItems = [
  { title: 'Home', path: '/' },
    ...pathSnippets.map((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      // 경로 조각에 따른 타이틀 설정
      const titles = {
        lms: 'LMS',
        kjo: 'KJO'
      };
      return {
        title: titles[snippet] || snippet.toUpperCase(),
        path: url
      };
    })
  ];
  const {token: { colorBgContainer, borderRadiusLG },} = theme.useToken();

  return (
    <Layout style={{ height: '100vh' }}>
      <Header />
      <Layout style={{ flex: 1 }}>
        <Sidebar
          selectedKey={selectedKey}
          setSelectedKey={setSelectedKey}
          navigate={navigate}
          items={menuItems}
        />
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
            items={breadcrumbItems.map(item => ({
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
            <Route path='/' element={ <Home />}/>
            <Route path='/lms' element={ <Lms />}/> 
            <Route path='/kjo' element={ <Kjo />}/> 
            <Route path='*' element={ <Home />}/>  
          </Routes>
          </Content>
        </Layout>
      </Layout>
      <Footer />
    </Layout>
  );
};

export default App;
