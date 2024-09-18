import type { ComponentType, ReactNode } from 'react';
import AssignmentIndTwoToneIcon from '@mui/icons-material/AssignmentIndTwoTone';

export interface MenuItem {
  link?: string;
  icon?: ComponentType;
  badge?: string;
  badgeTooltip?: string;

  items?: MenuItem[];
  name: string;
}

export interface MenuItems {
  items: MenuItem[];
  heading: string;
}

const menuItems: MenuItems[] = [
  {
    heading: 'Management',
    items: [
      {
        name: 'Users',
        icon: AssignmentIndTwoToneIcon,
        link: '',
        items: [
          {
            name: 'Dashboard',
            link: '/dashboard',
          },
          {
            name: 'User List',
            link: '/userlist',
          },
          {
            name: 'User Profile',
            link: '/profile',
          },
          {
            name: 'Reward',
            link: '/reports',
          },
          {
            name: 'Request for Selling',
            link: '/request-selling',
          },
        ],
      },
    ],
  },
];

export default menuItems;
