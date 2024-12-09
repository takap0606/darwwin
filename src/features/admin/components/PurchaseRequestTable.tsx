import { SetStateAction, useEffect, useState } from 'react';

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
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import useFirebase from 'lib/useFirebase';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import PurchaseRequestCard from './PurchaseRequestCard';

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

const PurchaseRequestTable = ({ transfered }: { transfered: boolean }) => {
  const { db } = useFirebase();
  const theme = useTheme();

  const classes = useStyles();
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([]);

  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    const searchPurchaseRequst = async () => {
      if (db) {
        const q = query(
          collection(db, 'purchase-request'),
          orderBy('sold_date', 'desc'),
          where('transfered', '==', transfered),
        );
        const querySnapshot = await getDocs(q);
        const requestList: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          requestList.push({
            uid: doc.id,
            ...data,
          });
        });
        setPurchaseRequests(requestList);
      }
    };
    searchPurchaseRequst();
  }, [db, updated]);

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(!open);
  };

  const option = ['A', 'B', 'C', 'D', 'E'];
  const [series, setSeries] = useState('all');

  const handleChangeSeries = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setSeries(e.target.value);
  };

  const filteredPurchaseRequest = purchaseRequests.filter((item) => {
    if (series === 'all') {
      return item;
    } else {
      return item.series === series;
    }
  });

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
            Purchase Request List
          </Typography>
          <Typography variant="h4">
            {transfered ? 'Transfered' : 'Not Transfered'}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
          <Box width="100px">
            <FormControl fullWidth>
              <Select value={series} onChange={handleChangeSeries}>
                <MenuItem value="all">All</MenuItem>
                {option.map((item, index) => (
                  <MenuItem value={item} key={index}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box onClick={handleOpen}>{!open ? <AddIcon /> : <RemoveIcon />}</Box>
        </Box>
      </Box>
      <List disablePadding>
        <Box px={3} pb={3}>
          <TableContainer>
            <TableWrapper>
              <TableHeadWrapper>
                <TableRow>
                  <TableCell>
                    <Typography className={classes.bold} noWrap>
                      Image
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography className={classes.bold} noWrap>
                      Name / Owner Wallet Address / Set Date
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography className={classes.bold} noWrap>
                      現在のウォレットアドレス / 運用状況
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold} noWrap>
                      Check
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold} noWrap>
                      Transfered
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold} noWrap>
                      Saved
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography className={classes.bold} noWrap>
                      Series
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography className={classes.bold} noWrap>
                      Delete
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHeadWrapper>
              {filteredPurchaseRequest.length > 0 &&
                filteredPurchaseRequest.map((request, index) => (
                  <PurchaseRequestCard
                    request={request}
                    key={index}
                    setUpdated={setUpdated}
                    updated={updated}
                  />
                ))}
            </TableWrapper>
          </TableContainer>
        </Box>
      </List>
    </Card>
  );
};

export default PurchaseRequestTable;
