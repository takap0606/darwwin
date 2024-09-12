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
import { useEffect, useState } from 'react';
import useFirebase from 'lib/useFirebase';
import BonusUserList from 'features/admin/components/FastBonusCalculation/BonusUserList';
import BonusListByMonth from './BonusListByMonth';
import { getNFTsByMonth, getUsers } from 'features/admin/utils/api';
import { mapUsersToInviters } from 'features/admin/utils/mapUsersToInviters';
import { calculateSalesPerInviter } from 'features/admin/utils/calculateSalesPerInviter';
import { startOfMonth } from 'utils/startOfMonth';
import { endOfMonth } from 'utils/endOfMonth';
import { downloadExcel } from 'features/admin/utils/downloadExcel';
import { REWARD_PERCENTAGE } from 'constants/REWARD_PERCENTAGE';
import { FAST_BONUS_REWARD_RATE } from 'constants/FAST_BONUS_REWARD_RATE';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { PAYMENT_FEE_PERCENTAGE } from 'constants/PAYMENT_FEE_PERCENTAGE';
import { getPaymentAmount } from 'utils/getPaymentAmount';

const FastBonusCalculation = () => {
  const { db } = useFirebase();
  const [bonusUsers, setBonusUsers] = useState<any>([]);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [selectedUser, setSelectedUser] = useState<any>({});

  const [date, setDate] = useState(new Date());

  const adjustMonth = (adjustment: number) => {
    setBonusUsers([]);
    setSelectedUser({});
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
      const allUsers = await getUsers(db);

      const referredUsersMap = mapUsersToInviters(allNftsByMonth, allUsers);
      const inviterSalesMap = calculateSalesPerInviter(referredUsersMap);

      const uniqueInvitersMap = new Map();
      allUsers.forEach((user) => {
        const inviter = allUsers.find(
          (inviter) => inviter.invitation_code === user.invited_code,
        );

        if (inviter) {
          const referredUsers = referredUsersMap.get(inviter.wallet_address);
          // 紹介した人がNFTを持っているかどうかを確認する
          if (referredUsers && referredUsers.length > 0) {
            const totalSales = inviterSalesMap.get(inviter.wallet_address);
            const fastBonusAmount = (
              totalSales *
              REWARD_PERCENTAGE *
              FAST_BONUS_REWARD_RATE
            ).toFixed(4);

            const paymentAmount = getPaymentAmount(Number(fastBonusAmount));

            const inviterWithReferredUsers = {
              ...inviter,
              referredUsers: referredUsers,
              totalSales: totalSales.toFixed(4),
              fastBonusAmount,
              paymentAmount,
            };

            uniqueInvitersMap.set(
              inviter.wallet_address,
              inviterWithReferredUsers,
            );
          }
        }
      });

      // ADMINを配列に含めないようにする
      uniqueInvitersMap.delete('0xD8ed53f3cB308BeEda8D56CEC661586428cFD797');

      const bonusUsersArray = Array.from(uniqueInvitersMap.values());
      setBonusUsers(bonusUsersArray);

      // 当月売上合計の計算
      const total = allNftsByMonth.reduce(
        (acc: any, curr: any) => acc + Number(curr.last_sale_eth_price),
        0,
      );
      setTotalSales(total.toFixed(4));
    };

    fetchData();
  }, [db, date]);

  const handleChangeUser = (user: any) => {
    setSelectedUser(user);
  };

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
      { header: 'TotalSales', key: 'totalSales' },
      { header: 'FastBonusAmount', key: 'fastBonusAmount' },
      { header: 'PaymentAmount', key: 'paymentAmount' },
    ];

    await downloadExcel({
      columns,
      data: bonusUsers,
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
    if (bonusUsers.length === 0) return;
    const affiliateCol = collection(db, 'affiliate');

    // Promise.allを使用して、全ての非同期操作が完了するのを待つ
    await Promise.all(
      bonusUsers.map(async (bonusUser: any) => {
        // ユーザーの情報を整形
        const newUser = {
          created_at: serverTimestamp(),
          wallet_address: bonusUser.wallet_address,
          bonus_type: 'fast_bonus',
          status: 'pending',
          total_sales: bonusUser.totalSales,
          bonus_amount: bonusUser.fastBonusAmount,
          referred_users: bonusUser.referredUsers.map((referredUser: any) => ({
            nfts: referredUser.nfts.map((nft: any) => ({
              created_at: nft.created_at,
              id: nft.id,
              image: nft.image,
              last_sale_eth_price: nft.last_sale_eth_price,
              last_sale_usd_price: nft.last_sale_usd_price,
              level: nft.level,
              name: nft.name,
              owner_wallet_address: nft.owner_wallet_address,
              series: nft.series,
            })),
            nickname: referredUser.nickname,
            wallet_address: referredUser.wallet_address,
          })),
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
                <BonusUserList
                  selectedUser={selectedUser}
                  handleChangeUser={handleChangeUser}
                  bonusUsers={bonusUsers}
                  totalSales={totalSales}
                />
              </Card>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <BonusListByMonth
            totalSales={totalSales}
            setPrevMonth={() => adjustMonth(-1)}
            setNextMonth={() => adjustMonth(1)}
            month={month}
            year={year}
            selectedUser={selectedUser}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default FastBonusCalculation;
