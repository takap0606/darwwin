import { Fragment } from 'react';

import {
  Box,
  Typography,
  Avatar,
  styled,
  useTheme,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';

const LabelSuccess = styled(Box)(
  ({ theme }) => `
        display: inline-block;
        background: ${theme.colors.success.lighter};
        color: ${theme.colors.success.main};
        text-transform: uppercase;
        font-size: ${theme.typography.pxToRem(11)};
        font-weight: bold;
        padding: ${theme.spacing(1, 2)};
        border-radius: ${theme.general.borderRadiusSm};
    `,
);

const TableRowDivider = styled(TableRow)(
  ({ theme }) => `
    height: ${theme.spacing(2)};
`,
);

const TransferListNftCard = ({ nft }: any) => {
  const theme = useTheme();

  const transfer_date = nft?.created_at
    ? nft?.created_at.toDate().toLocaleDateString('en-US')
    : '';

  return (
    <>
      <Fragment key={nft?.id}>
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
                  src={nft?.nft_image}
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
                  {nft?.nft_name}{' '}
                </Box>
                <Typography variant="subtitle2" noWrap>
                  {nft?.from} {' -> '} {nft?.to}
                </Typography>
                <Typography variant="subtitle2" noWrap>
                  {transfer_date}
                </Typography>
              </Box>
            </TableCell>
          </TableRow>
          <TableRowDivider />
        </TableBody>
      </Fragment>
    </>
  );
};

export default TransferListNftCard;
