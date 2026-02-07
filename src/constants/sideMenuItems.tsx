// sideMenuItems.tsx (veya aynı dosyanın üstü)

import Link from 'next/link';

import {
  DollarCircleFilled,
  DollarOutlined,
  EditFilled,
  LockFilled,
  MailFilled,
  OrderedListOutlined,
  PhoneFilled,
  PieChartOutlined,
  PlusSquareFilled,
  QuestionCircleFilled,
  RocketFilled,
  ToolOutlined,
  UnorderedListOutlined,
  UsergroupDeleteOutlined,
  UserOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

import { company } from '@/constants';
import { UserRole } from '@/lib/getCurrentUser';

const sideMenuItems = (role: UserRole | ''): MenuProps['items'] => [
  {
    key: '/panel',
    icon: <PieChartOutlined />,
    label: <Link href="/panel">Genel Bakış</Link>,
  },
  {
    key: 'gonderilerim',
    icon: <RocketFilled />,
    label: 'Gönderilerim',
    children: [
      {
        key: 'ekle',
        icon: <PlusSquareFilled />,
        label: <Link href="/panel/gonderilerim/ekle">Gönderi Yap</Link>,
      },
      {
        key: 'listele',
        icon: <UnorderedListOutlined />,
        label: <Link href="/panel/gonderilerim/listele">Listele</Link>,
      },
    ],
  },
  {
    key: 'cari-hesabim',
    icon: <DollarCircleFilled />,
    label: <Link href="/panel/cari-hesabim">Cari Hesabım</Link>,
  },
  {
    key: 'fiyat-listem',
    icon: <OrderedListOutlined />,
    label: <Link href="/panel/fiyat-listem">Fiyat Listem</Link>,
  },
  {
    key: 'hesabim',
    icon: <UserOutlined />,
    label: 'Hesabım',
    children: [
      {
        key: 'duzenle',
        icon: <EditFilled />,
        label: <Link href="/panel/hesabim/duzenle">Bilgileri Düzenle</Link>,
      },
      {
        key: 'parola-degistir',
        icon: <LockFilled />,
        label: <Link href="/panel/hesabim/parola-degistir">Parola Değiştir</Link>,
      },
    ],
  },
  ...(role !== 'CUSTOMER'
    ? [
        {
          key: 'yonetim',
          icon: <ToolOutlined />,
          label: 'Yönetim',
          children: [
            {
              key: 'tum-gonderiler',
              icon: <OrderedListOutlined />,
              label: <Link href="/panel/yonetim/tum-gonderiler">Tüm Gönderiler</Link>,
            },
            {
              key: 'uyeler',
              icon: <UsergroupDeleteOutlined />,
              label: <Link href="/panel/yonetim/uyeler">Kullanıcılar</Link>,
            },
            {
              key: 'fiyat-listeleri',
              icon: <DollarOutlined />,
              label: <Link href="/panel/yonetim/fiyat-listeleri">Fiyat Listeleri</Link>,
            },
          ],
        },
      ]
    : []),
  {
    key: 'destek',
    icon: <QuestionCircleFilled />,
    label: 'Destek',
    children: [
      {
        key: 'whatsapp',
        icon: <WhatsAppOutlined />,
        label: (
          <a href={company.whatsappLink} target="_blank" rel="noreferrer">
            Whatsapp
          </a>
        ),
      },
      {
        key: 'email',
        icon: <MailFilled />,
        label: (
          <a href={company.emailLink} target="_blank" rel="noreferrer">
            E-Posta
          </a>
        ),
      },
      {
        key: 'phone',
        icon: <PhoneFilled />,
        label: (
          <a href={company.phoneLink} target="_blank" rel="noreferrer">
            Telefon
          </a>
        ),
      },
    ],
  },
];

export default sideMenuItems;
