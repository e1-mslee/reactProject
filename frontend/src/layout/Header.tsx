import { Layout } from 'antd';
import logo from '@assets/Logo.png';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const { Header: AntHeader } = Layout;

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

// 타입 가드 함수 추가
const isValidJwtPayload = (payload: unknown): payload is JwtPayload => {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof (payload as JwtPayload).sub === 'string' &&
    typeof (payload as JwtPayload).role === 'string' &&
    typeof (payload as JwtPayload).exp === 'number'
  );
};

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const decoded = jwtDecode(token);

      // 타입 가드를 사용한 안전한 타입 체크
      if (!isValidJwtPayload(decoded)) {
        throw new Error('Invalid JWT payload structure');
      }

      // 토큰 만료 확인
      if (decoded.exp * 1000 > Date.now()) {
        setUsername(decoded.sub);
      } else {
        localStorage.removeItem('accessToken');
        setUsername(null);
      }
    } catch (error: unknown) {
      // error를 명시적으로 unknown으로 타이핑
      console.error('토큰 파싱 오류:', error);
      localStorage.removeItem('accessToken');
      setUsername(null);
    }
  }, []);

  const handleAuth = () => {
    if (username) {
      // 로그아웃
      localStorage.removeItem('accessToken');
      setUsername(null);
      window.location.reload();
    } else {
      // 로그인 페이지 이동
      void navigate('/login');
    }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {username && <span style={{ fontWeight: 'normal' }}>{`${username}님 안녕하세요.`}</span>}
          <Button type='primary' onClick={handleAuth}>
            {username ? '로그아웃' : '로그인'}
          </Button>
        </div>
      </AntHeader>
    </>
  );
};

export default Header;
