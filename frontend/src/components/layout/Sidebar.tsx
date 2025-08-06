import { Layout, Menu, theme, type MenuProps } from 'antd';
import { type NavigateFunction } from 'react-router-dom';
const { Sider } = Layout;

interface SidebarProps {
  selectedKey: string;
  setSelectedKey: (key: string) => void;
  navigate: NavigateFunction;
  items: MenuProps['items'];
}

const Sidebar: React.FC<SidebarProps> = ({ selectedKey, setSelectedKey, navigate, items }) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Sider
      width={200}
      style={{
        background: colorBgContainer,
        height: '100%',
        borderRight: '1px solid #f0ebec',
        boxShadow: 'inset -0.5px 0 0 0 #e4e4e4',
      }}
    >
      <Menu
        mode='inline'
        selectedKeys={[selectedKey]}
        defaultSelectedKeys={['home']}
        defaultOpenKeys={['uda', 'admin', 'templet']}
        style={{ height: '100%', borderRight: 0 }}
        items={items || []}
        onClick={({ key }) => {
          if (selectedKey !== key) {
            setSelectedKey(key);
          }
          void navigate('/' + key);
        }}
      />
    </Sider>
  );
};

export default Sidebar;
