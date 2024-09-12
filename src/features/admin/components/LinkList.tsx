import { Button, Grid } from '@mui/material';
import { useRouter } from 'next/router';

const MENUS = [
  {
    id: 'user',
    name: 'User',
    path: '/admin',
  },
  {
    id: 'log-profile',
    name: 'Log Profile',
    path: '/admin/log-profile',
  },
  {
    id: 'asset-control',
    name: 'Asset Control',
    path: '/admin/asset-control',
  },
  // {
  //   id: 'affiliate-calculation',
  //   name: 'Affiliate Calculation',
  //   path: '/admin/affiliate-calculation',
  // },
  {
    id: 'affiliate-control',
    name: 'Affiliate Record',
    path: '/admin/affiliate-record',
  },
  {
    id: 'series-total',
    name: 'NFT Total',
    path: '/admin/nft/total',
  },
  {
    id: 'series-a',
    name: 'A series',
    path: '/admin/series/a',
  },
  {
    id: 'series-b',
    name: 'B series',
    path: '/admin/series/b',
  },
  {
    id: 'series-c',
    name: 'C series',
    path: '/admin/series/c',
  },
  {
    id: 'series-d',
    name: 'D series',
    path: '/admin/series/d',
  },
  {
    id: 'series-e',
    name: 'E series',
    path: '/admin/series/e',
  },
  {
    id: 'series-f',
    name: 'F series',
    path: '/admin/series/f',
  },
  {
    id: 'series-g',
    name: 'G series',
    path: '/admin/series/g',
  },
  {
    id: 'series-h',
    name: 'H series',
    path: '/admin/series/h',
  },
  {
    id: 'series-i',
    name: 'I series',
    path: '/admin/series/i',
  },
  {
    id: 'series-j',
    name: 'J series',
    path: '/admin/series/j',
  },
  {
    id: 'duplication',
    name: 'Dupulication',
    path: '/admin/nft-duplication',
  },
  {
    id: 'nft-current-price',
    name: 'NFT Current Price',
    path: '/admin/nft-current-price',
  },
  {
    id: 'transfer',
    name: 'NFT Transfer',
    path: '/admin/transfer',
  },
  {
    id: 'nft-update-data',
    name: 'NFT Update Data',
    path: '/admin/nft-update-data',
  },
  // {
  //   id: 'purchase-request',
  //   name: 'Purchase Request',
  //   path: '/admin/purchase-request',
  // },
];

const AdminLinkList = () => {
  const router = useRouter();
  const currentPath = router.pathname;
  return (
    <Grid container spacing={2}>
      {MENUS.map(({ id, path, name }) => (
        <Grid item key={id}>
          <Button
            variant={path === currentPath ? 'contained' : 'text'}
            onClick={() => {
              void router.push(path);
            }}
          >
            {name}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
};

export default AdminLinkList;
