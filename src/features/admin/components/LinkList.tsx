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
    id: 'set-initial-token',
    name: 'Set Initial Token',
    path: '/admin/nft/set-initial-token',
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
    id: 'series-x',
    name: 'X series',
    path: '/admin/series/x',
  },
  {
    id: 'series-ultra',
    name: 'Ultra Rare',
    path: '/admin/series/ultra',
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
  {
    id: 'purchase-request',
    name: 'Purchase Request',
    path: '/admin/purchase-request',
  },
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
