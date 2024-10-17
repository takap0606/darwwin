import {
  Box,
  Typography,
  styled,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { CoinType, orderPriority } from 'features/admin/utils/coinUtils';
import { FC } from 'react';

const LabelSuccess = styled(Box)(
  ({ theme }) => `
    display: inline-block;
    background: ${theme.palette.success.light};
    color: ${theme.palette.success.main};
    text-transform: uppercase;
    font-size: ${theme.typography.pxToRem(11)};
    font-weight: bold;
    padding: ${theme.spacing(1, 2)};
    border-radius: ${theme.shape.borderRadius}px;
  `,
);

const TableRowDivider = styled(TableRow)(
  ({ theme }) => `
    height: ${theme.spacing(2)};
  `,
);

interface ItemData {
  created_at: {
    toDate: () => Date;
  };
  weekly_p_growth: string;
  [key: string]: any;
}

interface AssetControlSeriesUltraListCardProps {
  item: ItemData;
}

const AssetControlSeriesUltraListCard: FC<
  AssetControlSeriesUltraListCardProps
> = ({ item }) => {
  const coinKeys = Object.keys(item).filter(
    (key): key is CoinType => key in orderPriority,
  );

  return (
    <TableBody>
      <TableRow hover>
        <TableCell>
          <Box pl={1}>
            <Typography variant="subtitle2" noWrap>
              {item.created_at.toDate().toLocaleDateString('en-US')}
            </Typography>
          </Box>
        </TableCell>
        {coinKeys
          .sort((a, b) => orderPriority[a] - orderPriority[b])
          .map((key) => (
            <TableCell key={key} align="left">
              <LabelSuccess>{item[key]}</LabelSuccess>
            </TableCell>
          ))}
        <TableCell align="left">
          <LabelSuccess>{item.weekly_p_growth}</LabelSuccess>
        </TableCell>
      </TableRow>
      <TableRowDivider />
    </TableBody>
  );
};

export default AssetControlSeriesUltraListCard;
