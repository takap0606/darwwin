import Head from 'next/head';
import { useState, useEffect, useContext, Fragment } from 'react';
import {
  Card,
  Box,
  Grid,
  useTheme,
  Button,
  Divider,
  List,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  styled,
  alpha,
} from '@mui/material';

import Typography from '@mui/material/Typography';
import {
  collection,
  doc,
  endAt,
  getDoc,
  getDocs,
  orderBy,
  query,
  startAt,
  where,
} from 'firebase/firestore';
import { UserContext } from 'contexts/UserContext';
import useFirebase from 'lib/useFirebase';
import ReportsListCard from 'features/reports/ReportsListCard';
import PageHeaderWrapper from 'components/ui/PageHeaderWrapper';
import PageHeader from 'components/ui/PageHeader';
import { startOfMonth } from 'utils/startOfMonth';
import { endOfMonth } from 'utils/endOfMonth';

const ImageWrapper = styled(Box)(
  ({ theme }) => `
    margin: ${theme.spacing(2, 0, 1, -0.5)};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: ${theme.spacing(1)};
    padding: ${theme.spacing(0.5)};
    border-radius: 60px;
    height: ${theme.spacing(12)};
    width: ${theme.spacing(12)};
    background: ${
      theme.palette.mode === 'dark'
        ? theme.colors.alpha.trueWhite[30]
        : alpha(theme.colors.alpha.black[100], 0.07)
    };
    -webkit-animation: glow 2s linear 0s infinite alternate;

    img {
    background: ${theme.colors.alpha.trueWhite[100]};
    padding: ${theme.spacing(0.5)};
    display: block;
    border-radius: inherit;
    height: ${theme.spacing(11)};
    width: ${theme.spacing(11)};
    }
`,
);

const ReportsContent = () => {
  const theme = useTheme();
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [updated, setUpdated] = useState(false);
  const { db } = useFirebase();

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (
        db &&
        userInfo.walletAddress !== undefined &&
        userInfo.walletAddress !== ''
      ) {
        const docRef = doc(collection(db, 'users'), userInfo.walletAddress);
        const docSnap = await getDoc(docRef);
        const options = { year: 'numeric', month: 'long' };
        if (docSnap.exists()) {
          setUserInfo({
            walletAddress: docSnap.data().wallet_address,
            nickname: docSnap.data().nickname,
            peEmail: docSnap.data().pe_email || '',
            peUsername: docSnap.data().pe_username || '',
            registeredDate: docSnap
              .data()
              .registered_date.toDate()
              .toLocaleDateString('en-US', options),
            imageUrl: docSnap.data().image_url || '',
            invitationCode: docSnap.data().invitation_code,
            rate: docSnap.data().rate,
          });
        }
      }
    };
    fetchUserInfo();
  }, [db, userInfo.walletAddress, updated, setUpdated]);

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

  //Affiliate Rewards List
  const [affiliateList, setAffiliateList] = useState<any[]>([]);
  const [totalBonusAmount, setTotalBonusAmount] = useState(0);
  const [capitalgainList, setCapitalgainList] = useState<any[]>([]);

  const searchAffiliateRewardsTotal = async () => {
    //Firestoreからuserdataを読み込み
    if (db) {
      const q = query(
        collection(db, 'affiliate'),
        where('wallet_address', '==', userInfo.walletAddress),
        where('bonus_type', '==', 'introduction_bonus'),
      );

      const querySnapshot = await getDocs(q);
      let total = 0;
      querySnapshot.forEach((doc) => {
        total += Number(doc.data().bonus_amount);
      });
      setTotalBonusAmount(total);
    }
  };

  const searchAffiliateRewards = async () => {
    if (db) {
      const q = query(
        collection(db, 'affiliate'),
        where('wallet_address', '==', userInfo.walletAddress),
        where('bonus_type', '==', 'introduction_bonus'),
        orderBy('created_at'),
        startAt(start),
        endAt(end),
      );

      const querySnapshot = await getDocs(q);
      const recordList: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const newDate = data.created_at.toDate();
        // 一つ前の月を設定
        newDate.setMonth(newDate.getMonth() - 1);
        const newYear = newDate.getFullYear();
        const newMonth = newDate.getMonth() + 1;
        const created_at = `${newYear}/${newMonth}`;
        recordList.push({
          uid: doc.id,
          created_at: created_at,
          bonus_type: data.bonus_type,
          sales_amount: data.sales_amount,
          bonus_amount: data.bonus_amount,
          wallet_address: data.wallet_address,
          set_rate: data.set_rate,
          status: data.status,
        });
      });
      setAffiliateList(recordList);
    }
  };

  const searchCapitalGainBonus = async () => {
    if (db) {
      const q = query(
        collection(db, 'affiliate'),
        where('wallet_address', '==', userInfo.walletAddress),
        where('bonus_type', '==', 'capitalgain'),
        orderBy('created_at'),
        startAt(start),
        endAt(end),
      );

      const querySnapshot = await getDocs(q);
      const recordList: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const newDate = data.created_at.toDate();
        // 一つ前の月を設定
        newDate.setMonth(newDate.getMonth() - 1);
        const newYear = newDate.getFullYear();
        const newMonth = newDate.getMonth() + 1;
        const created_at = `${newYear}/${newMonth}`;
        recordList.push({
          uid: doc.id,
          created_at: created_at,
          bonus_type: data.bonus_type,
          wallet_address: data.wallet_address,
          set_rate: data.set_rate,
          get_rate: data.get_rate,
          status: data.status,
          sold_nft: data.sold_nft,
          tokens: data.tokens,
        });
      });
      setCapitalgainList(recordList);
    }
  };

  useEffect(() => {
    searchAffiliateRewards();
    searchAffiliateRewardsTotal();
    searchCapitalGainBonus();
  }, [db, date, updated]);

  return (
    <>
      <Head>
        <title>CRYPTO TRUST Dashboard - Affiliate Reward</title>
      </Head>
      <PageHeaderWrapper>
        <PageHeader
          header="Affiliate Rewards"
          description="Affiliate rewards and progress."
        />
      </PageHeaderWrapper>
      <Grid
        sx={{
          px: 4,
          mb: 4,
        }}
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={4}
      >
        <Grid item md={12} xs={12}>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="stretch"
            spacing={4}
            minHeight="60vh"
          >
            <Grid item xs={12} md={12}>
              <Card>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    background: `${theme.colors.alpha.black[5]}`,
                  }}
                  py={2}
                >
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
                </Box>
                <Divider />
                <Grid container>
                  <Grid item xs={12}>
                    <Typography
                      textAlign={{ xs: 'center', md: 'center' }}
                      pt={2}
                    >
                      Cumulative Bonus Amount
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      variant="h4"
                      fontSize="1.2rem"
                      textAlign="center"
                      pt={1}
                      pb={2}
                    >
                      {totalBonusAmount.toFixed(3)} ETH
                    </Typography>
                  </Grid>
                </Grid>
                <List disablePadding>
                  {affiliateList.map((item, index) => (
                    <ReportsListCard
                      key={index}
                      item={item}
                      setUpdated={setUpdated}
                      updated={updated}
                    />
                  ))}
                </List>
              </Card>
              {/* Capital Gain */}
              {capitalgainList.length > 0 && (
                <Card sx={{ marginTop: '20px' }}>
                  <Box mt={2} mb={1}>
                    <Typography
                      fontSize={14}
                      fontWeight="bold"
                      textAlign="center"
                    >
                      Capital Gain
                    </Typography>
                  </Box>
                  <List>
                    {capitalgainList.map((item, index) => (
                      <Fragment key={index}>
                        {item?.tokens?.btc > 0 && (
                          <Box mb={1}>
                            <Grid item xs={12}>
                              <TableContainer component={Paper}>
                                <Table
                                  sx={{ minWidth: 650 }}
                                  aria-label="table"
                                >
                                  <TableHead>
                                    <TableRow>
                                      <TableCell align="right">
                                        NFT Image
                                      </TableCell>
                                      <TableCell align="right">
                                        Name / Sold Owner
                                      </TableCell>
                                      <TableCell align="right">Rate</TableCell>
                                      <TableCell align="right">
                                        Get Rate
                                      </TableCell>
                                      {/* 一列目 */}
                                      <TableCell align="right">BTC</TableCell>
                                      {/* 二列目 */}
                                      <TableCell align="right">ETH</TableCell>
                                      {/* 三列目 */}
                                      <TableCell align="right">
                                        {item?.sold_nft?.series == 'A' && 'PDT'}
                                        {item?.sold_nft?.series == 'B' && 'PDT'}
                                        {item?.sold_nft?.series == 'C' && 'PDT'}
                                        {item?.sold_nft?.series == 'D' && 'PDT'}
                                        {item?.sold_nft?.series == 'E' && 'PDT'}
                                        {item?.sold_nft?.series == 'F' && 'XRP'}
                                        {item?.sold_nft?.series == 'G' && 'SOL'}
                                        {item?.sold_nft?.series == 'H' && 'PDT'}
                                        {item?.sold_nft?.series == 'I' && 'PDT'}
                                        {item?.sold_nft?.series == 'J' && 'PDT'}
                                        {item?.sold_nft.nft_name ==
                                          'LUPPY UR#10005' && 'XRP'}
                                        {item?.sold_nft.nft_name ==
                                          'LUPPY UR#10007' && 'XRP'}
                                      </TableCell>
                                      {/* 四列目 */}
                                      <TableCell align="right">
                                        {item?.sold_nft?.series == 'A' && 'XRP'}
                                        {item?.sold_nft?.series == 'B' && 'SOL'}
                                        {item?.sold_nft?.series == 'C' && 'ADA'}
                                        {item?.sold_nft?.series == 'D' && 'FIL'}
                                        {item?.sold_nft?.series == 'E' &&
                                          'MATIC'}
                                        {item?.sold_nft?.series == 'F' && 'TRX'}
                                        {item?.sold_nft?.series == 'G' &&
                                          'AVAX'}
                                        {item?.sold_nft?.series == 'H' && 'XRP'}
                                        {item?.sold_nft?.series == 'I' &&
                                          'MATIC'}
                                        {item?.sold_nft?.series == 'J' && 'LTC'}
                                        {item?.sold_nft.nft_name ==
                                          'LUPPY UR#10005' && 'MATIC'}
                                        {item?.sold_nft.nft_name ==
                                          'LUPPY UR#10007' && 'PDT'}
                                      </TableCell>
                                      {/* 五列目 */}
                                      <TableCell align="right">
                                        {' '}
                                        {item?.sold_nft?.series == 'A' &&
                                          'ATOM'}
                                        {item?.sold_nft?.series == 'B' && 'BNB'}
                                        {item?.sold_nft?.series == 'C' && 'DOT'}
                                        {item?.sold_nft?.series == 'D' &&
                                          'AVAX'}
                                        {item?.sold_nft?.series == 'E' &&
                                          'SAND'}
                                        {item?.sold_nft?.series == 'F' && ''}
                                        {item?.sold_nft?.series == 'G' &&
                                          'ATOM'}
                                        {item?.sold_nft?.series == 'H' &&
                                          'LINK'}
                                        {item?.sold_nft?.series == 'I' &&
                                          'DOGE'}
                                        {item?.sold_nft?.series == 'J' && 'XMR'}
                                        {item?.sold_nft.nft_name ==
                                          'LUPPY UR#10005' && 'PDT'}
                                        {item?.sold_nft.nft_name ==
                                          'LUPPY UR#10007' && 'LTC'}
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    <TableRow
                                      key={item?.wallet_address}
                                      sx={{
                                        '&:last-child td, &:last-child th': {
                                          border: 0,
                                        },
                                      }}
                                    >
                                      <TableCell align="right">
                                        <ImageWrapper className="glow-animation">
                                          <img
                                            src={item?.sold_nft?.nft_image}
                                            alt=""
                                          />
                                        </ImageWrapper>
                                      </TableCell>
                                      <TableCell align="right">
                                        <Box>{item?.sold_nft?.nft_name}</Box>
                                        <Box>
                                          {
                                            item?.sold_nft
                                              ?.sold_owner_wallet_address
                                          }
                                        </Box>
                                      </TableCell>
                                      <TableCell align="right">
                                        {item?.set_rate}
                                      </TableCell>
                                      <TableCell align="right">
                                        {item?.get_rate}
                                      </TableCell>
                                      <TableCell align="right">
                                        {item.tokens?.btc}
                                      </TableCell>
                                      <TableCell align="right">
                                        {item.tokens?.eth}
                                      </TableCell>
                                      <TableCell align="right">
                                        {item.sold_nft.series == 'A' &&
                                          item.tokens?.pdt}
                                        {item.sold_nft.series == 'B' &&
                                          item.tokens?.pdt}
                                        {item.sold_nft.series == 'C' &&
                                          item.tokens?.pdt}
                                        {item.sold_nft.series == 'D' &&
                                          item.tokens?.pdt}
                                        {item.sold_nft.series == 'E' &&
                                          item.tokens?.pdt}
                                        {item.sold_nft.series == 'F' &&
                                          item.tokens?.xrp}
                                        {item.sold_nft.series == 'G' &&
                                          item.tokens?.sol}
                                        {item.sold_nft.series == 'H' &&
                                          item.tokens?.pdt}
                                        {item.sold_nft.series == 'I' &&
                                          item.tokens?.pdt}
                                        {item.sold_nft.series == 'J' &&
                                          item.tokens?.pdt}
                                        {item?.sold_nft.nft_name ==
                                          'LUPPY UR#10005' && item?.tokens?.xrp}
                                        {item?.sold_nft.nft_name ==
                                          'LUPPY UR#10007' && item?.tokens?.xrp}
                                      </TableCell>
                                      <TableCell align="right">
                                        {item.sold_nft.series == 'A' &&
                                          item.tokens?.xrp}
                                        {item.sold_nft.series == 'B' &&
                                          item.tokens?.sol}
                                        {item.sold_nft.series == 'C' &&
                                          item.tokens?.ada}
                                        {item.sold_nft.series == 'D' &&
                                          item.tokens?.fil}
                                        {item.sold_nft.series == 'E' &&
                                          item.tokens?.matic}
                                        {item.sold_nft.series == 'F' &&
                                          item.tokens?.trx}
                                        {item.sold_nft.series == 'G' &&
                                          item.tokens?.avax}
                                        {item.sold_nft.series == 'H' &&
                                          item.tokens?.xrp}
                                        {item.sold_nft.series == 'I' &&
                                          item.tokens?.matic}
                                        {item.sold_nft.series == 'J' &&
                                          item.tokens?.ltc}
                                        {item?.sold_nft.nft_name ==
                                          'LUPPY UR#10005' &&
                                          item?.tokens?.matic}
                                        {item?.sold_nft.nft_name ==
                                          'LUPPY UR#10007' && item?.tokens?.pdt}
                                      </TableCell>
                                      <TableCell align="right">
                                        {item.sold_nft.series == 'A' &&
                                          item.tokens?.atom}
                                        {item.sold_nft.series == 'B' &&
                                          item.tokens?.bnb}
                                        {item.sold_nft.series == 'C' &&
                                          item.tokens?.dot}
                                        {item.sold_nft.series == 'D' &&
                                          item.tokens?.avax}
                                        {item.sold_nft.series == 'E' &&
                                          item.tokens?.sand}
                                        {item.sold_nft.series == 'G' &&
                                          item.tokens?.atom}
                                        {item.sold_nft.series == 'H' &&
                                          item.tokens?.link}
                                        {item.sold_nft.series == 'I' &&
                                          item.tokens?.doge}
                                        {item.sold_nft.series == 'J' &&
                                          item.tokens?.xmr}
                                        {item?.sold_nft.nft_name ==
                                          'LUPPY UR#10005' && item?.tokens?.pdt}
                                        {item?.sold_nft.nft_name ==
                                          'LUPPY UR#10007' && item?.tokens?.ltc}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Grid>
                          </Box>
                        )}
                      </Fragment>
                    ))}
                  </List>
                </Card>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default ReportsContent;
