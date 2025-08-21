import { Layout } from 'antd';
import logo from '@assets/Logo.png';
import { Button, Modal, message, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import api from '@api/api';
import { Dropdown } from 'antd';
import { SettingOutlined, LogoutOutlined, UserDeleteOutlined, UserOutlined } from '@ant-design/icons';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { AxiosError } from 'axios';

const { Header: AntHeader } = Layout;

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
}

interface ErrorResponse {
  message: string;
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

  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);

  const openPwdModal = () => setIsPwdModalOpen(true);
  const closePwdModal = () => setIsPwdModalOpen(false);

  const handlePasswordChange = async (values: { oldPassword: string; newPassword: string }) => {
    try {
      await api.post('/passwordChange', values, { withCredentials: true });
      message.success('비밀번호가 변경되었습니다.');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const data = err.response?.data as ErrorResponse | undefined;
        const msg = data?.message ?? '비밀번호를 다시 확인해주세요.';
        message.error(msg);
      } else {
        message.error('비밀번호를 다시 확인해주세요.');
      }
    }
  };

  const userMenu = [
    // {
    //   key: 'edit',
    //   label: <span style={{ fontWeight: 'bold' }}>개인정보 변경</span>,
    //   icon: <UserOutlined />,
    // },
    {
      key: 'password',
      label: (
        <span style={{ fontWeight: 'bold' }} onClick={openPwdModal}>
          비밀번호 변경
        </span>
      ),
      icon: <SettingOutlined />,
    },
    {
      key: 'delete',
      danger: true,
      label: (
        <span style={{ fontWeight: 'bold' }} onClick={() => void userDelete()}>
          회원탈퇴
        </span>
      ),
      icon: <UserDeleteOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      danger: true,
      label: (
        <span style={{ fontWeight: 'bold' }} onClick={() => void handleAuth()}>
          로그아웃
        </span>
      ),
      icon: <LogoutOutlined />,
    },
  ];

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

  const handleAuth = async () => {
    if (username) {
      try {
        await api.post('/logout', {}, { withCredentials: true });
      } catch (err) {
        console.error('로그아웃 실패:', err);
      } finally {
        localStorage.removeItem('accessToken');
        setUsername(null);
        window.location.reload();
      }
    } else {
      void navigate('/login');
    }
  };

  // 삭제 핸들러
  const userDelete = () => {
    Modal.confirm({
      title: '알림',
      content: '회원탈퇴 하시겠습니까?',
      style: { top: 200 },
      async onOk() {
        try {
          await api.post('/userDelete', {}, { withCredentials: true });
        } catch (err) {
          console.error('탈퇴 실패:', err);
        } finally {
          localStorage.removeItem('accessToken');
          setUsername(null);
          window.location.reload();
        }
      },
    });
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
          {username && (
            <Dropdown menu={{ items: userMenu }} placement='bottomRight'>
              <span style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                {username}님 <ArrowDropDownIcon style={{ verticalAlign: 'middle' }} />
              </span>
            </Dropdown>
          )}
          <span onClick={() => void handleAuth()}>
            <span style={{ fontSize: '12px', letterSpacing: '-2px', paddingRight: '5px' }}>
              {username ? '로그아웃' : '로그인'}
            </span>
            {username ? <LogoutIcon /> : <LoginIcon />}
          </span>
        </div>
      </AntHeader>
      {/* 비밀번호 변경 모달 */}
      <Modal title='비밀번호 변경' open={isPwdModalOpen} onCancel={closePwdModal} footer={null}>
        <Form<PasswordForm> layout='vertical' onFinish={(values) => void handlePasswordChange(values)}>
          <Form.Item
            label='현재 비밀번호'
            name='oldPassword'
            rules={[{ required: true, message: '현재 비밀번호를 입력하세요.' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label='새 비밀번호'
            name='newPassword'
            rules={[{ required: true, message: '새 비밀번호를 입력하세요.' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit' style={{ width: '100%' }}>
              변경
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Header;
