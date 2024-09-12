import {
  Button,
  Card,
  Grid,
  Table,
  TableContainer,
  Typography,
  Paper,
  Box,
  List,
  useTheme,
} from '@mui/material';
import NftListItem from 'features/admin/components/PartnerRewardCalculation/NftListItem';
import { Fragment } from 'react';

const NftListByMonth = ({
  setPrevMonth,
  setNextMonth,
  month,
  year,
  nfts,
  totalSales,
}: any) => {
  const theme = useTheme();
  return (
    <Card>
      <Grid container alignItems="center" justifyContent="center" py={2}>
        <Grid item>
          <Button onClick={() => setPrevMonth()}>Prev Month</Button>
        </Grid>
        <Grid item>
          <Typography>
            {month}/{year}
          </Typography>
        </Grid>
        <Grid item>
          <Button onClick={() => setNextMonth()}>Next Month</Button>
        </Grid>
      </Grid>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        pb={3}
      >
        <Typography variant="h4">
          当月の売上合計 {totalSales.toFixed(4)} ETH
        </Typography>
        <Typography variant="h4" mt={1}>
          Partner報酬合計(5%) {(totalSales * 0.05).toFixed(4)} ETH
        </Typography>
        <Typography variant="h4" mt={1}>
          竹村/高野チーム(5%) {(totalSales * 0.05).toFixed(4)} ETH
        </Typography>
      </Box>
      <Box
        alignItems="center"
        sx={{
          background: `${theme.colors.alpha.black[5]}`,
        }}
        p={2}
      >
        <List disablePadding>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              {nfts.length > 0 &&
                nfts.map((nft: any) => (
                  <Fragment key={nft?.id}>
                    <NftListItem nft={nft} />
                  </Fragment>
                ))}
            </Table>
          </TableContainer>
        </List>
      </Box>
    </Card>
  );
};

export default NftListByMonth;
