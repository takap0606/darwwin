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

const TableRowDivider = styled(TableRow)(
  ({ theme }) =>
    `
      height: ${theme.spacing(2)};
    `,
);

const NftListItem = ({ nft }: any) => {
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
          </Box>
        </TableCell>
        <TableCell>
          <Box pl={1}>
            <Box
              color="text.primary"
              fontWeight="bold"
              sx={{
                '&:hover': {
                  color: `${theme.colors.primary.main}`,
                },
              }}
            >
              {nft?.name}{' '}
            </Box>
            <Typography variant="subtitle2" noWrap>
              {nft?.owner_wallet_address}
            </Typography>
            <Typography variant="subtitle2" noWrap>
              {set_date}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box>
            <LabelSuccess>{nft?.series}</LabelSuccess>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box>
            <LabelSuccess>{nft?.level}</LabelSuccess>
          </Box>
        </TableCell>
        {nft?.series === 'X' && (
          <TableCell align="center">
            <Box>
              <LabelSuccess>{nft?.pa_dividend_rate}</LabelSuccess>
            </Box>
          </TableCell>
        )}
        <TableCell align="center">
          <Box>
            <LabelSuccess>{nft?.activeStatus}</LabelSuccess>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box>
            <LabelSuccess>{nft?.last_sale_eth_price} ETH</LabelSuccess>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box>
            <LabelSuccess>{nft?.last_sale_usd_price} USD</LabelSuccess>
          </Box>
        </TableCell>
        <TableCell>
          <Box display="flex" alignItems="center">
            <Box>
              <Box
                color="text.primary"
                sx={{
                  '&:hover': {
                    color: `${theme.colors.primary.main}`,
                  },
                }}
              >
                <Typography noWrap>{nft?.memo}</Typography>
              </Box>
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Box display="flex" alignItems="center">
            <Box>
              <Box
                color="text.primary"
                sx={{
                  '&:hover': {
                    color: `${theme.colors.primary.main}`,
                  },
                }}
              >
                {(nft?.set_btc == undefined || nft?.set_btc == '0') &&
                  'Not Operated Yet'}
              </Box>
            </Box>
          </Box>
        </TableCell>
      </TableRow>
      <TableRowDivider />
    </TableBody>
  );
};

export default NftListItem;
