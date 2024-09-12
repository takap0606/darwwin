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

const BonusUserList = ({ bonusUsers, selectedUser, handleChangeUser }: any) => {
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
          <Table aria-label="partner table">
            <TableHeadWrapper>
              <TableRow>
                <TableCell>
                  <Typography noWrap>Nickname / Wallet Address</Typography>
                </TableCell>
              </TableRow>
            </TableHeadWrapper>

            {bonusUsers.map((user: any) => {
              return (
                <TableBody
                  key={user.wallet_address}
                  sx={{
                    opacity:
                      selectedUser?.wallet_address === user.wallet_address
                        ? 0.5
                        : 1,
                  }}
                  onClick={() => handleChangeUser(user)}
                >
                  <TableRow hover>
                    <TableCell>
                      <Typography>{user.nickname}</Typography>
                      <Typography>{user.wallet_address}</Typography>
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

export default BonusUserList;
