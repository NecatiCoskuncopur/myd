'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

import { Layout, Menu } from 'antd';
import styled from 'styled-components';

import { sideMenuItems } from '@/constants';
import { UserRole } from '@/lib/getCurrentUser';

const { Sider } = Layout;

type SideMenuProps = {
  role: UserRole | '';
};

const SideMenu: React.FC<SideMenuProps> = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const selectedKey = pathname.split('/').at(-1) ?? '/panel';

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)} style={{ userSelect: 'none' }}>
      <LogoWrapper>MYD {!collapsed && 'Export'}</LogoWrapper>

      <Menu theme="dark" mode="inline" items={sideMenuItems(role)} selectedKeys={[selectedKey]} defaultOpenKeys={['gonderilerim', 'hesabim']} />
    </Sider>
  );
};

export default SideMenu;

const LogoWrapper = styled.div`
  font-size: 30px;
  text-align: center;
  color: #fff;
  margin-bottom: 10px;
`;
