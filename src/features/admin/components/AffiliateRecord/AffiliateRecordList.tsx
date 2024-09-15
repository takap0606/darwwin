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
  Button,
  Checkbox,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import {
  collection,
  endAt,
  getDocs,
  orderBy,
  query,
  startAt,
  where,
} from 'firebase/firestore';
import useFirebase from 'lib/useFirebase';
import { startOfMonth } from 'utils/startOfMonth';
import { endOfMonth } from 'utils/endOfMonth';
import AffiliateRecordListCard from 'features/admin/components/AffiliateRecord/AffiliateRecordListCard';
import { PAYMENT_FEE_PERCENTAGE } from 'constants/PAYMENT_FEE_PERCENTAGE';

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

const AffiliateRecordList = () => {
  const { db } = useFirebase();
  const theme = useTheme();

  const classes = useStyles();

  const [showUnsent, setShowUnsent] = useState(false);

  const handleShowUnsentChange = (event: {
    target: { checked: boolean | ((prevState: boolean) => boolean) };
  }) => {
    setShowUnsent(event.target.checked);
  };

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(!open);
  };

  //過去実績の取得
  const [record, setRecord] = useState<any>([]);
  const [updated, setUpdated] = useState(false);

  //Search by month
  const [date, setDate] = useState(new Date());

  //前月
  const setPrevMonth = () => {
    const year = date.getFullYear();
    const month = date.getMonth() - 1;
    const day = date.getDate();
    setDate(new Date(year, month, day));
  };
  //翌月
  const setNextMonth = () => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    setDate(new Date(year, month, day));
  };

  const start = startOfMonth(date);
  const end = endOfMonth(date);

  const today = date;
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  useEffect(() => {
    const searchRecord = async () => {
      if (db) {
        const q = query(
          collection(db, 'affiliate'),
          orderBy('created_at'),
          where('bonus_type', '==', 'introduction_bonus'),
          startAt(start),
          endAt(end),
        );

        const querySnapshot = await getDocs(q);
        const recordList: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          recordList.push({
            uid: doc.id,
            created_at: data.created_at
              .toDate()
              .setMonth(data.created_at.toDate().getMonth() - 1),
            bonus_type: data.bonus_type,
            bonus_amount: data.bonus_amount,
            wallet_address: data.wallet_address,
            status: data.status,
          });
        });
        setRecord(recordList);
      }
    };
    searchRecord();
  }, [db, updated, date]);

  const filteredRecord = showUnsent
    ? record.filter((item: { status: string }) => item.status !== 'paid')
    : record;

  // 切り捨て
  // const floorDecimal = (value: number, n: number) => {
  //   return Math.floor(value * Math.pow(10, n)) / Math.pow(10, n);
  // };

  // 支払い合計ETH
  let totalPaymentAmount = 0;
  filteredRecord.forEach((r: { bonus_amount: number }) => {
    totalPaymentAmount += Number(
      (r.bonus_amount * PAYMENT_FEE_PERCENTAGE).toFixed(3),
    );
  });

  return (
    <>
      <Box mt={2}>
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
                Past affiliate rewards
              </Typography>
              <Typography variant="h4">LIST</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Button onClick={() => setPrevMonth()}>Prev Month</Button>
              {month == 1 ? (
                <Typography>12/{year - 1}</Typography>
              ) : (
                <Typography>
                  {month - 1}/{year}
                </Typography>
              )}
              <Button onClick={() => setNextMonth()}>Next Month</Button>
            </Box>
            <Box display="flex" alignItems="center">
              <Box mr={3}>
                <Typography>表示件数 {filteredRecord.length}件</Typography>
              </Box>
              <Box mr={3}>
                <Typography>{totalPaymentAmount.toFixed(3)} ETH</Typography>
              </Box>
              <Box display="flex" alignItems="center" mr={3}>
                <Checkbox
                  checked={showUnsent}
                  onChange={handleShowUnsentChange}
                  inputProps={{ 'aria-label': 'Show unsent only' }}
                />
                <Typography>未送信のみ</Typography>
              </Box>
              <Box onClick={handleOpen}>
                {!open ? <AddIcon /> : <RemoveIcon />}
              </Box>
            </Box>
          </Box>
          {open && (
            <List disablePadding>
              <Box px={3} pb={3}>
                <TableContainer>
                  <TableWrapper>
                    <TableHeadWrapper>
                      <TableRow>
                        <TableCell align="left">
                          <Typography className={classes.bold}>
                            Paid Button
                          </Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography className={classes.bold}>Date</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography className={classes.bold}>
                            Nickname / Wallet Address
                          </Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography className={classes.bold}>
                            Bybit Username/ email
                          </Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography className={classes.bold}>
                            Payment Amount
                          </Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography className={classes.bold}>
                            Status
                          </Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography className={classes.bold}>Type</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography className={classes.bold}>Edit</Typography>
                        </TableCell>
                      </TableRow>
                    </TableHeadWrapper>
                    {filteredRecord.map((item: any) => (
                      <AffiliateRecordListCard
                        item={item}
                        key={item.uid}
                        setUpdated={setUpdated}
                        updated={updated}
                      />
                    ))}
                  </TableWrapper>
                </TableContainer>
              </Box>
            </List>
          )}
        </Card>
      </Box>
    </>
  );
};

export default AffiliateRecordList;
