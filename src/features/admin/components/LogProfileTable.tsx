import { useEffect, useState } from 'react';

import {
  Box,
  List,
  Card,
  alpha,
  Typography,
  styled,
  useTheme,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Table,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import useFirebase from 'lib/useFirebase';
import { collection, getDocs, query } from 'firebase/firestore';
import LogProfileCard from './LogProfileCard';

const useStyles = makeStyles({
  bold: {
    fontWeight: '800!important',
  },
});

const TableWrapper = styled(Table)(
  ({ theme }) => `
  
      thead tr th {
          border: 0;
      }
  
      tbody tr td {
          position: relative;
          border: 0;
  
          & > div {
              position: relative;
              z-index: 5;
          }
  
          &::before {
              position: absolute;
              left: 0;
              top: 0;
              transition: ${theme.transitions.create(['all'])};
              height: 100%;
              width: 100%;
              content: "";
              background: ${theme.colors.alpha.white[100]};
              border-top: 1px solid ${theme.colors.alpha.black[10]};
              border-bottom: 1px solid ${theme.colors.alpha.black[10]};
              pointer-events: none;
              z-index: 4;
          }
  
          &:first-of-type:before {
              border-top-left-radius: ${theme.general.borderRadius};
              border-bottom-left-radius: ${theme.general.borderRadius};
              border-left: 1px solid ${theme.colors.alpha.black[10]};
          }
          
  
          &:last-child:before {
              border-top-right-radius: ${theme.general.borderRadius};
              border-bottom-right-radius: ${theme.general.borderRadius};
              border-right: 1px solid ${theme.colors.alpha.black[10]};
          }
      }
  
      tbody tr:hover td::before {
          background: ${alpha(theme.colors.primary.main, 0.02)};
          border-color: ${alpha(
            theme.colors.alpha.black[100],
            0.25,
          )} !important;
      }
  
    `,
);

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

const LogProfileTable = () => {
  const { db } = useFirebase();
  const theme = useTheme();

  const classes = useStyles();
  const [logs, setLogs] = useState<any[]>([]);

  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    const searchLogs = async () => {
      if (db) {
        const q = query(collection(db, 'log'));
        const querySnapshot = await getDocs(q);
        const logList: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          logList.push({
            uid: doc.id,
            ...data,
          });
        });
        setLogs(logList);
      }
    };
    searchLogs();
  }, [db, updated]);

  return (
    <Card>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          background: `${theme.colors.alpha.black[5]}`,
        }}
        p={2}
      >
        <Box>
          <Typography
            variant="caption"
            fontWeight="bold"
            sx={{
              fontSize: `${theme.typography.pxToRem(12)}`,
            }}
          >
            Log Profile
          </Typography>
        </Box>
      </Box>
      <List disablePadding>
        <Box px={3} pb={3}>
          <TableContainer>
            <TableWrapper>
              <TableHeadWrapper>
                <TableRow>
                  <TableCell align="left">
                    <Typography className={classes.bold} noWrap>
                      Name / Wallet Address
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography className={classes.bold} noWrap>
                      Update Date
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography className={classes.bold} noWrap>
                      Old PE Username
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography className={classes.bold} noWrap>
                      Old PE Email
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography className={classes.bold} noWrap>
                      New PE Username
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography className={classes.bold} noWrap>
                      Old PE Email
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHeadWrapper>
              {logs.length > 0 &&
                logs.map((log) => <LogProfileCard log={log} key={log.uid} />)}
            </TableWrapper>
          </TableContainer>
        </Box>
      </List>
    </Card>
  );
};

export default LogProfileTable;
