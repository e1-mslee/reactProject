import { useNavigate } from 'react-router-dom';
import { Layout } from 'antd';
import logo from '@assets/Logo.png';
import { Button } from 'antd';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        void navigate('/login'); // 이동할 경로
    };

  return (
    <>
      <AntHeader
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingInline: 24,
          color: '#333',
          fontSize: '16px',
          justifyContent: 'space-between',
          fontWeight: 'bold',
          background: '#fff',
          borderBottom: '1px solid #f0ebec',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
          <img src={logo} alt='Logo' style={{ height: 32, marginRight: 12 }} />
          UDA 시스템 관리(BS 3팀)
        </div>
        <Button type='primary' onClick={handleClick}>로그인</Button>
      </AntHeader>
    </>
  );
};

export default Header;
