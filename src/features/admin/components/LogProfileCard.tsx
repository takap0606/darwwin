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

const LogProfileCard = ({ log }: any) => {
  const theme = useTheme();

  const updateDate = log?.created_at
    ? log?.created_at.toDate().toLocaleDateString('en-US')
    : '';

  return (
    <TableBody>
      <TableRow hover>
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
              {log?.nickname}{' '}
            </Box>
            <Typography variant="subtitle2" noWrap>
              {log?.wallet_address}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box>
            <LabelSuccess>{updateDate}</LabelSuccess>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box>
            <LabelSuccess>{log?.old_pe_username}</LabelSuccess>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box>
            <LabelSuccess>{log?.old_pe_email}</LabelSuccess>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box>
            <LabelSuccess>{log?.new_pe_username}</LabelSuccess>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box>
            <LabelSuccess>{log?.new_pe_email}</LabelSuccess>
          </Box>
        </TableCell>
      </TableRow>
      <TableRowDivider />
    </TableBody>
  );
};

export default LogProfileCard;
