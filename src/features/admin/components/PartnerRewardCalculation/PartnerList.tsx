import {
  Box,
  List,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  useTheme,
} from '@mui/material';

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

const PartnerList = ({ partners, totalSales }: any) => {
  const theme = useTheme();

  return (
    <Box
      alignItems="center"
      sx={{
        background: `${theme.colors.alpha.black[5]}`,
      }}
      p={2}
    >
      <List disablePadding>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="partner table">
            <TableHeadWrapper>
              <TableRow>
                <TableCell>
                  <Typography noWrap>Nickname / Wallet Address</Typography>
                </TableCell>
                <TableCell>
                  <Typography noWrap>Dividend Rate</Typography>
                </TableCell>
                <TableCell>
                  <Typography noWrap>Reward</Typography>
                </TableCell>
              </TableRow>
            </TableHeadWrapper>

            {partners.map((partner: any) => {
              return (
                <TableBody key={partner.wallet_address}>
                  <TableRow hover>
                    <TableCell>
                      <Typography>{partner.nickname}</Typography>
                      <Typography>{partner.wallet_address}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography noWrap>
                        {(partner.dividendRate * 100).toFixed(3)} %
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography noWrap>{partner.reward} ETH</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              );
            })}
          </Table>
        </TableContainer>
      </List>
    </Box>
  );
};

export default PartnerList;
