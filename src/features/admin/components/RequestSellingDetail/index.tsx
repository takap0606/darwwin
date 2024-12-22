import {
  Box,
  Button,
  Grid,
  List,
  Paper,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
  styled,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import useFirebase from 'lib/useFirebase';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import {
  ReactChild,
  ReactFragment,
  ReactPortal,
  useEffect,
  useState,
} from 'react';
import BySeries from './BySeries';
import { SERIES_ASSETS } from 'constants/SERIES_ASSETS';
import { TOKENS } from 'constants/TOKENS';

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

type userProps = {
  pe_email: string;
  pe_username: string;
  invited_code: string;
  wallet_address: string;
  nickname: string;
};

const generateCryptoFields = (cryptoSymbol: string) => {
  const baseIdMap: { [key: string]: number } = {
    btc: 9,
    eth: 15,
    cmt: 21,
    sol: 27,
    atom: 33,
    ada: 39,
    dot: 45,
    fil: 51,
    avax: 57,
    xrp: 63,
    link: 69,
    trx: 75,
    matic: 81,
  };

  const baseId = baseIdMap[cryptoSymbol];

  if (baseId === undefined) {
    throw new Error(`Unrecognized crypto symbol: ${cryptoSymbol}`);
  }

  return [
    { id: baseId, name: `セット時点${cryptoSymbol.toUpperCase()}` },
    { id: baseId + 1, name: `売却申請時点${cryptoSymbol.toUpperCase()}` },
    { id: baseId + 2, name: `${cryptoSymbol.toUpperCase()}パーセント手数料` },
    {
      id: baseId + 3,
      name: `パーセント手数料引いた${cryptoSymbol.toUpperCase()}枚数`,
    },
    { id: baseId + 4, name: `5%手数料分(${cryptoSymbol.toUpperCase()})` },
    { id: baseId + 5, name: `送金分${cryptoSymbol.toUpperCase()}` },
  ];
};

const RequestSellingDetail = () => {
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const { db } = useFirebase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [nft, setNft] = useState<any>([]);
  const [user, setUser] = useState<userProps>({
    pe_email: '',
    pe_username: '',
    invited_code: '',
    wallet_address: '',
    nickname: '',
  });

  useEffect(() => {
    if (db) {
      const purchaseRequestRef = doc(
        db,
        'purchase-request',
        String(router.query.id),
      );

      getDoc(purchaseRequestRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const soldOwnerWalletAddress = data.sold_owner_wallet_address;
            setNft(data);

            const usersRef = query(
              collection(db, 'users'),
              where('wallet_address', '==', soldOwnerWalletAddress),
            );

            getDocs(usersRef)
              .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  setUser({
                    pe_username: doc.data().pe_username,
                    pe_email: doc.data().pe_email,
                    invited_code: doc.data().invited_code,
                    wallet_address: doc.data().wallet_address,
                    nickname: doc.data().nickname,
                  });
                });
              })
              .catch((error) => {
                console.log('Error getting documents:', error);
              });
          } else {
            console.log('No such document!');
          }
        })
        .catch((error) => {
          console.log('Error getting document:', error);
        });
    }
  }, [router.query.id, db]);

  const [parents, setParents] = useState<any>([]);

  const parentsArray: any = [];

  // 計算方法
  // 手数料 = 利益 * NFTの手数料％（20-30%）
  // 利益 = 手数料 ÷ NFTの手数料％（20-30%）
  // リーダー報酬 = 利益 * リーダー報酬％（5%）
  // 支払い額 = 報酬 - (報酬 * 支払い手数料％（5%))

  const fetchGetTokens = (rate: number) => {
    const calTokens = (token: number, decimals: number | undefined) => {
      const paymentFeeRate = 0.05; // 支払い手数料
      const commissionAmount = (token / nft.fee_rate) * rate; //　報酬額
      const paymentAmount =
        commissionAmount - commissionAmount * paymentFeeRate; // 支払い額
      return paymentAmount.toFixed(decimals);
    };

    const data: { [key: string]: any } = {};
    const assets = SERIES_ASSETS[nft.series];

    assets.forEach((asset: string) => {
      const tokenData = TOKENS.find(
        (token) => token.primary.toLowerCase() === asset,
      );
      if (!tokenData) {
        console.error(`Token data not found for: ${asset}`);
        return;
      }

      const tokenFeeName = `fee_${asset.toLowerCase()}`;
      data[asset] = calTokens(nft[tokenFeeName], tokenData.numDecimalPlaces);
    });

    return data;
  };

  const handleSearchParent = async (code: string) => {
    if (db) {
      const search = async (code: string) => {
        const usersQuery = query(
          collection(db, 'users'),
          where('invitation_code', '==', code),
        );

        const getRate = 0.05;

        await getDocs(usersQuery).then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            parentsArray.push({
              pe_email: data.pe_email,
              pe_username: data.pe_username,
              nickname: data.nickname,
              wallet_address: data.wallet_address,
              getRate: getRate,
              tokens: fetchGetTokens(getRate),
            });
          });
        });
        parentsArray.push({
          nickname: 'リーダー',
          getRate: getRate,
          tokens: fetchGetTokens(getRate),
        });
      };

      search(code);
      setParents(parentsArray);
    } else {
      console.log('No such document!');
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
  };

  const [affiliateSaved, setAffiliateSaved] = useState(false);

  const handleSave = () => {
    if (parents.length > 0 && db) {
      parents.forEach(
        (parent: { getRate: any; tokens: any; wallet_address: any }) => {
          const ref = doc(collection(db, 'affiliate'));

          setDoc(ref, {
            sold_nft: {
              nft_id: nft.nft_id,
              nft_name: nft.nft_name,
              nft_image: nft.nft_image,
              series: nft.series,
              sold_owner_wallet_address: nft.sold_owner_wallet_address,
            },
            get_rate: parent.getRate,
            tokens: parent.tokens,
            created_at: serverTimestamp(),
            bonus_type: 'capitalgain',
            status: 'pending',
            wallet_address: parent.wallet_address || '',
          })
            .then(() => {
              enqueueSnackbar('Successfully Record!', {
                variant: 'success',
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'right',
                },
                autoHideDuration: 2000,
                TransitionComponent: Slide,
              });
            })
            .catch((error) => {
              console.error('Error writing document: ', error);
            });
        },
      );

      const purchaseRequestRef = doc(
        db,
        'purchase-request',
        String(router.query.id),
      );

      updateDoc(purchaseRequestRef, {
        affiliate_saved: true,
      }).then(() => {
        setAffiliateSaved(true);
      });
    }
  };

  const [purchaseRequestTable, setPurchaseRequestTable] = useState([
    { id: 1, name: 'Wallet Address' },
    { id: 2, name: 'Bybitユーザー名' },
    { id: 3, name: 'Bybitメールアドレス' },
    { id: 0, name: '売却申請日' },
    { id: 4, name: '手数料RATE' },
    { id: 5, name: 'シリーズ' },
    { id: 6, name: 'NFT名' },
    { id: 7, name: 'セット時価格' },
    { id: 8, name: '売却時価格' },
  ]);

  useEffect(() => {
    const assets = SERIES_ASSETS[nft.series];
    if (assets) {
      const newTable = [
        ...purchaseRequestTable.slice(0, 9),
        ...assets.flatMap((crypto) => generateCryptoFields(crypto)),
      ];
      setPurchaseRequestTable(
        newTable.map((item) => ({ ...item, id: item.id || 0 })),
      );
    }
  }, [nft.series]);

  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
      </Head>
      {nft && (
        <Grid
          sx={{
            px: 4,
            my: 4,
          }}
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={4}
        >
          <Grid item xs={12} display="flex" alignItems="center">
            <Box px={3}>
              <ImageWrapper className="glow-animation">
                <img src={nft.nft_image} alt={nft.nft_name} />
              </ImageWrapper>
            </Box>
            <Box>
              <Typography variant="h4">
                {nft.nft_name} / {nft.series} series
              </Typography>
              <Typography variant="h4" mt={2}>
                {user.nickname} / {user.wallet_address}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <List disablePadding>
              <Box px={3} pb={3}>
                <TableContainer>
                  <TableWrapper>
                    {/* 項目 */}
                    <TableHeadWrapper>
                      <TableRow>
                        {purchaseRequestTable.map((item) => (
                          <TableCell key={item.id} align="left">
                            <Typography className={classes.bold} noWrap>
                              {item.name}
                            </Typography>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHeadWrapper>
                    {/* 詳細データ */}
                    <BySeries nft={nft} user={user} series={nft.series} />
                  </TableWrapper>
                </TableContainer>
              </Box>
            </List>
          </Grid>
          {/* キャピタルゲインボーナス計算 */}
          <Grid item xs={12}>
            <Box px={3}>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="right">送金先</TableCell>
                      <TableCell align="right">ニックネーム</TableCell>
                      <TableCell align="right">獲得％</TableCell>
                      {SERIES_ASSETS[nft.series] &&
                        SERIES_ASSETS[nft.series].map((asset: any) => {
                          const tokenData = TOKENS.find(
                            (token) => token.primary.toLowerCase() === asset,
                          );
                          console.log('tokenData', tokenData);

                          return (
                            <TableCell align="right" key={tokenData?.id}>
                              {tokenData?.primary}
                            </TableCell>
                          );
                        })}
                    </TableRow>
                  </TableHead>
                  {!isLoading && (
                    <TableBody>
                      {parents.map(
                        (row: {
                          wallet_address: string | number | null | undefined;
                          pe_email:
                            | boolean
                            | ReactChild
                            | ReactFragment
                            | ReactPortal
                            | null
                            | undefined;
                          pe_username:
                            | boolean
                            | ReactChild
                            | ReactFragment
                            | ReactPortal
                            | null
                            | undefined;
                          nickname:
                            | boolean
                            | ReactChild
                            | ReactFragment
                            | ReactPortal
                            | null
                            | undefined;
                          getRate:
                            | boolean
                            | ReactChild
                            | ReactFragment
                            | ReactPortal
                            | null
                            | undefined;
                          tokens: {
                            [x: string]:
                              | boolean
                              | ReactChild
                              | ReactFragment
                              | ReactPortal
                              | null
                              | undefined;
                          };
                        }) => {
                          return (
                            <TableRow
                              key={row.wallet_address}
                              sx={{
                                '&:last-child td, &:last-child th': {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell align="right">
                                {row.pe_email}
                                <br />
                                {row.pe_username}
                              </TableCell>
                              <TableCell component="th" scope="row">
                                {row.nickname}
                              </TableCell>
                              <TableCell align="right">{row.getRate}</TableCell>
                              {SERIES_ASSETS[nft.series] &&
                                SERIES_ASSETS[nft.series].map((asset: any) => {
                                  return (
                                    <TableCell align="right" key={asset}>
                                      {row.tokens?.[asset]}
                                    </TableCell>
                                  );
                                })}
                            </TableRow>
                          );
                        },
                      )}
                    </TableBody>
                  )}
                </Table>
              </TableContainer>
              {!isLoading && (
                <Grid mt={2}>
                  <Button
                    disabled={nft?.affiliate_saved || affiliateSaved}
                    onClick={() => handleSave()}
                  >
                    {nft?.affiliate_saved ? 'データを保存済み' : 'データを保存'}
                  </Button>
                </Grid>
              )}
            </Box>
          </Grid>
          {isLoading && (
            <Grid mt={2}>
              <Button onClick={() => handleSearchParent(user.invited_code)}>
                キャピタルゲインボーナスを確認
              </Button>
            </Grid>
          )}
        </Grid>
      )}
    </>
  );
};

export default RequestSellingDetail;
