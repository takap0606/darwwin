import {
  Avatar,
  Box,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  styled,
  useTheme,
} from '@mui/material';

const LabelSuccess = styled(Box)(
  ({ theme }) =>
    `
        display: inline-block;
        background: ${theme.colors.success.lighter};
        color: ${theme.colors.success.main};
        font-size: ${theme.typography.pxToRem(11)};
        font-weight: bold;
        padding: ${theme.spacing(1, 2)};
        border-radius: ${theme.general.borderRadiusSm};
      `,
);

const FastBonusListItem = ({ nft }: any) => {
  const theme = useTheme();
  const set_date = nft?.created_at
    ? nft?.created_at.toDate().toLocaleDateString('en-US')
    : '';
  return (
    <TableBody>
      <TableRow hover>
        <TableCell>
          <Box display="flex" alignItems="center">
            <Avatar
              sx={{
                fontSize: `${theme.typography.pxToRem(15)}`,
                background: `${theme.colors.alpha.black[10]}`,
                color: `${theme.colors.alpha.black[70]}`,
                width: 80,
                height: 80,
              }}
              alt=""
              src={nft?.image}
            ></Avatar>
            <Box pl={4}>
              <Box color="text.primary" fontWeight="bold">
                {nft?.name}{' '}
              </Box>
              <Typography variant="subtitle2" noWrap>
                {nft?.owner_wallet_address}
              </Typography>
              <Typography variant="subtitle2" noWrap>
                {set_date}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box>
            <LabelSuccess>{nft?.last_sale_eth_price} ETH</LabelSuccess>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow />
    </TableBody>
  );
};

export default FastBonusListItem;
