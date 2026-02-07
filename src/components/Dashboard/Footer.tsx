import { GithubFilled } from '@ant-design/icons';
import { Layout } from 'antd';

const Footer = () => (
  <Layout.Footer style={{ textAlign: 'center' }}>
    MYD Export © {new Date().getFullYear()} -{' '}
    <a href="https://github.com/NecatiCoskuncopur" target="_blank" rel="noreferrer">
      <GithubFilled /> Coded by Necati Coşkunçopur
    </a>
  </Layout.Footer>
);

export default Footer;
