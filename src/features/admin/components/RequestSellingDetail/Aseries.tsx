import {
  Box,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  styled,
} from '@mui/material';
import { Fragment } from 'react';

const TableRowDivider = styled(TableRow)(
  ({ theme }) => `
      height: ${theme.spacing(2)};
  `,
);

const AdminCalCapitalgainAseries = ({ nft, user }: { nft: any; user: any }) => {
  const TableCellWrapper = ({ children }: { children: React.ReactNode }) => (
    <TableCell>
      <Box pl={1}>
        <Typography variant="subtitle2" noWrap>
          {children}
        </Typography>
      </Box>
    </TableCell>
  );
  return (
    <Fragment>
      <TableBody>
        <TableRow hover>
          <TableCellWrapper>{nft.sold_owner_wallet_address}</TableCellWrapper>
          <TableCellWrapper>{user.pe_username}</TableCellWrapper>
          <TableCellWrapper>{user.pe_email}</TableCellWrapper>
          <TableCellWrapper>
            {nft.sold_date?.toDate().toLocaleString()}
          </TableCellWrapper>
          <TableCellWrapper>{nft.fee_rate}</TableCellWrapper>
          <TableCellWrapper>{nft.series}</TableCellWrapper>
          <TableCellWrapper>{nft.nft_name}</TableCellWrapper>
          <TableCellWrapper>{nft.last_sale_usd_price}</TableCellWrapper>
          <TableCellWrapper>{nft.current_asset_price}</TableCellWrapper>
          {/* BTC */}
          <TableCellWrapper>{nft.set_btc}</TableCellWrapper>
          <TableCellWrapper>{nft.sold_btc}</TableCellWrapper>
          <TableCellWrapper>{nft.fee_btc}</TableCellWrapper>
          <TableCellWrapper>{nft.without_fee_btc}</TableCellWrapper>
          <TableCellWrapper>{nft.without_fee_btc * 0.05}</TableCellWrapper>
          <TableCellWrapper>{nft.without_fee_btc * 0.95}</TableCellWrapper>
          {/* ETH */}
          <TableCellWrapper>{nft.set_eth}</TableCellWrapper>
          <TableCellWrapper>{nft.sold_eth}</TableCellWrapper>
          <TableCellWrapper>{nft.fee_eth}</TableCellWrapper>
          <TableCellWrapper>{nft.without_fee_eth}</TableCellWrapper>
          <TableCellWrapper>{nft.without_fee_eth * 0.05}</TableCellWrapper>
          <TableCellWrapper>{nft.without_fee_eth * 0.95}</TableCellWrapper>
          {/* PDT */}
          <TableCellWrapper>{nft.set_pdt}</TableCellWrapper>
          <TableCellWrapper>{nft.sold_pdt}</TableCellWrapper>
          <TableCellWrapper>{nft.fee_pdt}</TableCellWrapper>{' '}
          <TableCellWrapper>{nft.without_fee_pdt}</TableCellWrapper>
          <TableCellWrapper>{nft.without_fee_pdt * 0.05}</TableCellWrapper>
          <TableCellWrapper>{nft.without_fee_pdt * 0.95}</TableCellWrapper>
          {/* XRP */}
          <TableCellWrapper>{nft.set_xrp}</TableCellWrapper>
          <TableCellWrapper>{nft.sold_xrp}</TableCellWrapper>
          <TableCellWrapper>{nft.fee_xrp}</TableCellWrapper>{' '}
          <TableCellWrapper>{nft.without_fee_xrp}</TableCellWrapper>
          <TableCellWrapper>{nft.without_fee_xrp * 0.05}</TableCellWrapper>
          <TableCellWrapper>{nft.without_fee_xrp * 0.95}</TableCellWrapper>
          {/* ATOM */}
          <TableCellWrapper>{nft.set_atom}</TableCellWrapper>
          <TableCellWrapper>{nft.sold_atom}</TableCellWrapper>
          <TableCellWrapper>{nft.fee_atom}</TableCellWrapper>{' '}
          <TableCellWrapper>{nft.without_fee_atom}</TableCellWrapper>
          <TableCellWrapper>{nft.without_fee_atom * 0.05}</TableCellWrapper>
          <TableCellWrapper>{nft.without_fee_atom * 0.95}</TableCellWrapper>
        </TableRow>
        <TableRowDivider />
      </TableBody>
    </Fragment>
  );
};

export default AdminCalCapitalgainAseries;
