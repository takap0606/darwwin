import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from '@mui/material';
import PartnerList from 'features/admin/components/PartnerRewardCalculation/PartnerList';
import { useEffect, useState } from 'react';
import NftListByMonth from 'features/admin/components/PartnerRewardCalculation/NftListByMonth';
import useFirebase from 'lib/useFirebase';
import { startOfMonth } from 'utils/startOfMonth';
import { endOfMonth } from 'utils/endOfMonth';
import {
  getNFTsByMonth,
  getNftsFromSeries,
  getUsersFromWalletAddresses,
} from 'features/admin/utils/api';
import { getUniqueUsersWithNfts } from 'features/admin/utils/getUniqueUsersWithNfts';
import { downloadExcel } from 'features/admin/utils/downloadExcel';
import { REWARD_PERCENTAGE } from 'constants/REWARD_PERCENTAGE';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getPaymentAmount } from 'utils/getPaymentAmount';

const ParnterRewardCalculation = () => {
  const { db } = useFirebase();
  const [partners, setPartners] = useState<any>([]);
  const [nfts, setNfts] = useState<any>([]);
  const [totalSales, setTotalSales] = useState<number>(0);

  const [date, setDate] = useState(new Date());

  const adjustMonth = (adjustment: number) => {
    setTotalSales(0);
    setDate((prevDate) => {
      const year = prevDate.getFullYear();
      const month = prevDate.getMonth() + adjustment;
      const day = prevDate.getDate();
      return new Date(year, month, day);
    });
  };

  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      if (!db) return;
      const seriesArray = ['A', 'B', 'C', 'D', 'E'];
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const allNftsByMonth = await getNFTsByMonth(db, seriesArray, start, end);
      // 当月の売上合計の計算
      const total = allNftsByMonth.reduce(
        (acc: any, curr: any) => acc + Number(curr.last_sale_eth_price),
        0,
      );
      setNfts(allNftsByMonth);
      setTotalSales(total);
    };
    fetchData();
  }, [db, date]);

  useEffect(() => {
    const fetchData = async () => {
      if (!db || totalSales === undefined) return;
      const nftArray = await getNftsFromSeries(db, 'X');
      const usersArray = await getUsersFromWalletAddresses(
        db,
        nftArray.map((nft) => nft.wallet_address),
      );
      let partnerArray = getUniqueUsersWithNfts(usersArray, nftArray);

      partnerArray = partnerArray.map((partner: any) => {
        const dividendRate = Number(partner.nfts[0].pa_dividend_rate as number);
        const reward = (
          totalSales *
          dividendRate *
          // PARTNER_REWARD_RATE *
          REWARD_PERCENTAGE
        ).toFixed(4);

        const paymentAmount = getPaymentAmount(Number(reward));

        return {
          ...partner,
          dividendRate,
          reward,
          paymentAmount,
        };
      });

      setPartners(partnerArray);
    };
    fetchData();
  }, [db, totalSales]);

  // xlsx export
  const handleClickDownloadButton = async (
    e: React.MouseEvent<HTMLButtonElement>,
    format: string,
  ) => {
    e.preventDefault();

    const columns = [
      { header: 'Nickname', key: 'nickname' },
      { header: 'WalletAddress', key: 'wallet_address' },
      { header: 'PEUsername', key: 'pe_username' },
      { header: 'PEEmail', key: 'pe_email' },
      { header: 'InvitationCode', key: 'invitation_code' },
      { header: 'InvitedCode', key: 'invited_code' },
      { header: 'DividendRate', key: 'dividendRate' },
      { header: 'PartnerReward', key: 'reward' },
      { header: 'PaymentAmount', key: 'paymentAmount' },
    ];

    await downloadExcel({
      columns,
      data: partners,
      sheetName: 'parterBonusList',
      format,
      filename: 'parter_bonus_list',
    });
  };

  // 反映ボタンを押した時の処理
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickReflectButton = async () => {
    // Firestoreのaffiliateコレクションへの参照を取得
    if (!db) return;
    if (partners.length === 0) return;
    const affiliateCol = collection(db, 'affiliate');

    // Promise.allを使用して、全ての非同期操作が完了するのを待つ
    await Promise.all(
      partners.map(async (partner: any) => {
        // ユーザーの情報を整形
        const newUser = {
          created_at: serverTimestamp(),
          wallet_address: partner.wallet_address,
          bonus_type: 'partner_reward',
          status: 'pending',
          total_sales: totalSales,
          dividend_rate: partner.dividendRate,
          bonus_amount: partner.reward,
        };

        // 整形したデータをFirestoreのaffiliateコレクションに追加
        await addDoc(affiliateCol, newUser);
      }),
    );
    handleClose();
  };

  return (
    <>
      <Grid
        sx={{
          px: 4,
        }}
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={4}
      >
        <Grid item xs={12} md={6}>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="stretch"
          >
            <Grid item xs={12} md={12}>
              <Card>
                <Box py={2} display="flex" justifyContent="flex-end">
                  <Button
                    sx={{ mr: 2 }}
                    variant="outlined"
                    onClick={(e) => handleClickDownloadButton(e, 'xlsx')}
                  >
                    Excel
                  </Button>
                  <Button
                    sx={{ mr: 2 }}
                    variant="outlined"
                    onClick={handleClickOpen}
                  >
                    反映する
                  </Button>
                  <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                  >
                    <DialogTitle id="alert-dialog-title">
                      {'FAST BONUSの計算データ反映'}
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText id="alert-dialog-description">
                        {year}年{month}月 のFAST BONUSの計算データを反映します。
                        <br />
                        この操作は取り消せません。よろしいですか？
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleClose}>キャンセル</Button>
                      <Button onClick={handleClickReflectButton} autoFocus>
                        反映する
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Box>
                <PartnerList partners={partners} totalSales={totalSales} />
              </Card>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <NftListByMonth
            nfts={nfts}
            totalSales={totalSales}
            setPrevMonth={() => adjustMonth(-1)}
            setNextMonth={() => adjustMonth(1)}
            month={date.getMonth() + 1}
            year={date.getFullYear()}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ParnterRewardCalculation;
