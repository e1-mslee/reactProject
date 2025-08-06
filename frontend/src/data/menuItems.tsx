import { LaptopOutlined, UserOutlined } from '@ant-design/icons';

const menuItems = [
  {
    key: 'home',
    icon: <UserOutlined />,
    label: 'HOME',
  },
  {
    key: 'uda',
    icon: <LaptopOutlined />,
    label: 'UDA',
    children: [
      { key: 'lms', label: 'LMS' },
      { key: 'kjo', label: 'KJO' },
    ],
  },
  {
    key: 'templet',
    icon: <LaptopOutlined />,
    label: '디자인 템플릿',
    children: [
      { key: 'grid', label: '그리드' },
      { key: 'comp', label: '컴포넌트' },
      { key: 'color', label: '색상' },
    ],
  },
  {
    key: 'admin',
    icon: <LaptopOutlined />,
    label: '관리자 설정',
    children: [
      { key: 'code', label: '공통코드 관리' },
      { key: 'user', label: '사용자 관리' },
      { key: 'role', label: '권한 관리' },
    ],
  },
];

export default menuItems;
