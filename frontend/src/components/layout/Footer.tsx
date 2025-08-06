import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

const Footer: React.FC = () => {
  return (
    <AntFooter
      style={{
        textAlign: 'center',
        background: '#fff',
        color: '#333',
        paddingInline: 24,
        padding: '12px 0',
        fontSize: '12px',
        fontWeight: 'bold',
        borderTop: '1px solid #e4dcdd',
      }}
    >
      © 2025 UDA 시스템 관리 (BS 3팀)
    </AntFooter>
  );
};

export default Footer;
