import { Layout, Menu, theme } from 'antd';

const { Sider } = Layout;

const Sidebar = ({ selectedKey, setSelectedKey, navigate, items }) => {
  const {token: { colorBgContainer }} = theme.useToken();

  return (
    <Sider width={200} style={
      { background: colorBgContainer, height: '100%',borderRight: '1px solid #f0ebec',boxShadow: 'inset -0.5px 0 0 0 #e4e4e4' }
      }>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultSelectedKeys={['home']}
        defaultOpenKeys={['uda', 'admin', 'templet']}
        style={{ height: '100%', borderRight: 0 }}
        items={items}
        onClick={({ key }) => {
          setSelectedKey(key);
          navigate('/' + key);
        }}
      />
    </Sider>
  );
};

export default Sidebar;
