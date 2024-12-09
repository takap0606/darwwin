import {
  Box,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  styled,
} from '@mui/material';
import { SERIES_ASSETS } from 'constants/SERIES_ASSETS';
import { Fragment } from 'react';

const TableRowDivider = styled(TableRow)(
  ({ theme }) => `
      height: ${theme.spacing(2)};
  `,
);

import { ReactNode } from 'react';

const TableCellWrapper = ({ children }: { children: ReactNode }) => (
  <TableCell>
    <Box pl={1}>
      <Typography variant="subtitle2" noWrap>
        {children}
      </Typography>
    </Box>
  </TableCell>
);

const BySeries = ({
  nft,
  user,
  series,
}: {
  nft: any;
  user: any;
  series: any;
}) => {
  const assets = SERIES_ASSETS[series];

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
          {assets &&
            assets.map((asset, index) => (
              <Fragment key={index}>
                <TableCellWrapper>{nft[`set_${asset}`]}</TableCellWrapper>
                <TableCellWrapper>{nft[`sold_${asset}`]}</TableCellWrapper>
                <TableCellWrapper>{nft[`fee_${asset}`]}</TableCellWrapper>
                <TableCellWrapper>
                  {nft[`without_fee_${asset}`]}
                </TableCellWrapper>
                <TableCellWrapper>
                  {nft[`without_fee_${asset}`] * 0.05}
                </TableCellWrapper>
                <TableCellWrapper>
                  {nft[`without_fee_${asset}`] * 0.95}
                </TableCellWrapper>
              </Fragment>
            ))}
        </TableRow>
        <TableRowDivider />
      </TableBody>
    </Fragment>
  );
};

export default BySeries;
