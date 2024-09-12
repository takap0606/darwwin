import { Button, Grid } from '@mui/material';
import { useRouter } from 'next/router';

const MENUS = [
  {
    id: 'user',
    name: 'User',
    path: '/admin-curation',
  },
  {
    id: 'series-total',
    name: 'NFT Total',
    path: '/admin-curation/nft/total',
  },
];

function AdminCurationLinkList() {
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
}

export default AdminCurationLinkList;
