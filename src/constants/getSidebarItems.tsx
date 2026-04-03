import { AddBox, AttachMoney, Build, Dashboard, FormatListNumbered, GroupRemove, ListAlt, Person, RocketLaunch } from '@mui/icons-material';

const getSidebarItems = (role: UserTypes.ICurrentUser['role'] | ''): UserTypes.ISidebarItem[] => [
  {
    key: '/panel',
    label: 'Genel Bakış',
    icon: <Dashboard />,
    path: '/panel',
  },
  {
    key: 'gonderilerim',
    label: 'Gönderilerim',
    icon: <RocketLaunch />,
    children: [
      {
        key: 'ekle',
        label: 'Gönderi Yap',
        icon: <AddBox />,
        path: '/panel/gonderilerim/ekle',
      },
      {
        key: 'listele',
        label: 'Listele',
        icon: <ListAlt />,
        path: '/panel/gonderilerim/listele',
      },
    ],
  },
  {
    key: 'cari-hesabim',
    label: 'Cari Hesabım',
    icon: <AttachMoney />,
    path: '/panel/cari-hesabim',
  },
  {
    key: 'fiyat-listem',
    label: 'Fiyat Listem',
    icon: <FormatListNumbered />,
    path: '/panel/fiyat-listem',
  },
  {
    key: 'hesabim',
    label: 'Hesabım',
    icon: <Person />,
    path: '/panel/hesabim',
  },
  ...(role !== 'CUSTOMER'
    ? [
        {
          key: 'yonetim',
          label: 'Yönetim',
          icon: <Build />,
          children: [
            {
              key: 'tum-gonderiler',
              label: 'Tüm Gönderiler',
              icon: <FormatListNumbered />,
              path: '/panel/yonetim/tum-gonderiler',
            },
            {
              key: 'uyeler',
              label: 'Kullanıcılar',
              icon: <GroupRemove />,
              path: '/panel/yonetim/uyeler',
            },
            {
              key: 'fiyat-listeleri',
              label: 'Fiyat Listeleri',
              icon: <AttachMoney />,
              path: '/panel/yonetim/fiyat-listeleri',
            },
          ],
        },
      ]
    : []),
];

export default getSidebarItems;
