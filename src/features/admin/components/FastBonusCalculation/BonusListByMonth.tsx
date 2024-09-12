import {
  Button,
  Card,
  Grid,
  Table,
  TableContainer,
  Typography,
  Paper,
  Box,
  useTheme,
  TableHead,
  TableRow,
  TableCell,
  styled,
} from '@mui/material';
import { Fragment } from 'react';
import BonusListItem from 'features/admin/components/FastBonusCalculation/BonusListItem';

const TableHeadWrapper = styled(TableHead)(
  ({ theme }) => `
          .MuiTableCell-root {
              text-transform: none;
              font-weight: normal;
              color: ${theme.colors.alpha.black[100]};
              font-size: ${theme.typography.pxToRem(16)};
              padding: ${theme.spacing(2)};
          }
    
          .MuiTableRow-root {
              background: transparent;
          }
      `,
);

const BonusListByMonth = ({
  setPrevMonth,
  setNextMonth,
  month,
  year,
  totalSales,
  selectedUser,
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
        <Typography variant="h4">当月の売上合計 {totalSales} ETH</Typography>
      </Box>
      <Box
        alignItems="center"
        sx={{
          background: `${theme.colors.alpha.black[5]}`,
        }}
        p={2}
      >
        <Typography variant="h4" px={2}>
          対象ユーザー: {selectedUser?.nickname}
        </Typography>
        <Typography variant="h4" noWrap px={2} py={2}>
          売上合計: {selectedUser?.totalSales} ETH
        </Typography>
        <Typography variant="h4" noWrap px={2} pb={2}>
          FAST BONUS: {selectedUser?.fastBonusAmount} ETH
        </Typography>
        <TableContainer component={Paper}>
          {selectedUser?.referredUsers?.map((user: any) => {
            return (
              <Table
                key={user.wallet_address}
                sx={{ minWidth: 650 }}
                aria-label="simple table"
              >
                <TableHeadWrapper>
                  <TableRow>
                    <TableCell sx={{ border: 'none' }}>
                      <Typography variant="h4" noWrap p={2}>
                        {user.nickname}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHeadWrapper>
                {user.nfts?.map((nft: any) => {
                  return (
                    <Fragment key={nft.id}>
                      <BonusListItem nft={nft} />
                    </Fragment>
                  );
                })}
              </Table>
            );
          })}
        </TableContainer>
      </Box>
    </Card>
  );
};

export default BonusListByMonth;
