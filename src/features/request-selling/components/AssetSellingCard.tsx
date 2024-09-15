import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  styled,
  Typography,
  Card,
  Divider,
  Avatar,
  ListItem,
  ListItemText,
  List,
  ListItemAvatar,
  Fade,
  alpha,
  CircularProgress,
  Modal,
  useTheme,
  Skeleton,
} from '@mui/material';
import TrendingUp from '@mui/icons-material/TrendingUp';
import { Chart } from 'components/ui/Chart';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import useFirebase from 'lib/useFirebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { AssetCardData, SellingCardProps } from 'features/dashboard/types';
import { createPortfolio } from 'utils/createPortfolio';
import { useSnackbar } from 'notistack';
import { Slide } from '@mui/material';
import { useFormik } from 'formik';
import { generateAreaChartConfig } from 'utils/generateAreaChartConfig';
import { getCumulativePGrowthData } from 'utils/getCumulativePGrowthData';
import { getDecimalPlacesByTokenName } from 'utils/getDecimalPlacesByTokenName';
import { calculateTokens } from 'utils/calculateTokens';
import { TRANSFER_ADDRESS } from 'constants/TRANSFER_ADDRESS';
import createPortfolioForUltra from 'utils/createPortfolioForUltra';
import { SERIES_ASSETS } from 'constants/SERIES_ASSETS';

const AvatarSuccess = styled(Avatar)(
  ({ theme }) => `
        background-color: ${theme.colors.success.main};
        color: ${theme.palette.success.contrastText};
        width: ${theme.spacing(8)};
        height: ${theme.spacing(8)};
        box-shadow: ${theme.colors.shadows.success};
  `,
);

const ListItemAvatarWrapper = styled(ListItemAvatar)(
  ({ theme }) => `
min-width: 0;
display: flex;
align-items: center;
justify-content: center;
margin-right: ${theme.spacing(1)};
padding: ${theme.spacing(0.5)};
margin-left: 15px;
border-radius: 60px;
background: ${
    theme.palette.mode === 'dark'
      ? theme.colors.alpha.trueWhite[30]
      : alpha(theme.colors.alpha.black[100], 0.07)
  };

img {
    background: ${theme.colors.alpha.trueWhite[100]};
    padding: ${theme.spacing(0.5)};
    display: block;
    border-radius: inherit;
    height: ${theme.spacing(4.5)};
    width: ${theme.spacing(4.5)};
}
`,
);

const ImageWrapper = styled(Box)(
  ({ theme }) => `
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: ${theme.spacing(1)};
    padding: ${theme.spacing(0.5)};
    width: 100%;
    height: auto;
    background: ${
      theme.palette.mode === 'dark'
        ? theme.colors.alpha.trueWhite[30]
        : alpha(theme.colors.alpha.black[100], 0.07)
    };
    img {
    background: ${theme.colors.alpha.trueWhite[100]};
    padding: ${theme.spacing(0.5)};
    display: block;
    width: 100%;
    height: auto;
    }
`,
);

const LabelSuccess = styled(Box)(
  ({ theme }) => `
        display: inline-block;
        background: ${theme.colors.success.lighter};
        color: ${theme.colors.success.main};
        text-transform: uppercase;
        font-size: ${theme.typography.pxToRem(11)};
        font-weight: bold;
        padding: ${theme.spacing(0.3, 2)};
        border-radius: ${theme.general.borderRadiusSm};
    `,
);

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 380,
  bgcolor: 'background.paper',
  border: '1px solid #CBCCD2',
  borderRadius: '10px',
  boxShadow: 24,
  px: 3,
  py: 2,
  background:
    'linear-gradient(180deg,rgba(35,30,33,.8),rgba(21,25,28,.99)),#171a1e',
};

const AssetSellingCard = ({
  data,
  tokens,
  sellingFeeRate,
  isLoading,
  setIsLoading,
}: SellingCardProps) => {
  const { db } = useFirebase();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const {
    id,
    name,
    image,
    last_sale_eth_price,
    last_sale_usd_price,
    created_at,
    owner_wallet_address,
    series,
    level,
    ...sets
  } = data as AssetCardData;

  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(!open);
  };

  const [chartData, setChartData] = useState<any>([]);
  const [chartDate, setChartDate] = useState<string[]>([]);

  const getRecords = async () => {
    if (!db) return;
    const q = query(
      collection(db, 'record'),
      where('series', '==', series),
      where('target', 'array-contains', id),
      orderBy('created_at'),
    );

    try {
      const querySnapshot = await getDocs(q);
      let chartDataTotal = 0;
      const dataArray: string[] | ((prevState: never[]) => never[]) = [];
      const dateArray: string[] | ((prevState: never[]) => never[]) = [];
      await Promise.all(
        querySnapshot.docs.map((doc: any) => {
          const created_at = new Date(
            doc.data().created_at.toDate(),
          ).toLocaleDateString();
          dateArray.push(created_at);
          chartDataTotal += Number(doc.data().weekly_p_growth);
          dataArray.push(Number(chartDataTotal * 100).toFixed(3));
        }),
      );
      setChartData(dataArray);
      setChartDate(dateArray);
      chartDataTotal = 0;
    } catch (e) {
      throw e;
    }
  };

  // Chart
  const areaChartConfig: any = generateAreaChartConfig(chartDate);
  const cumulativePGrowthData: any = getCumulativePGrowthData(chartData);

  const [chartOpen, setChartOpen] = useState(false);

  const [records, setRecords] = useState<any>([]);

  useEffect(() => {
    if (db && series && id) {
      const searchRecords = async () => {
        setIsLoading(true);
        const q = query(
          collection(db, 'record'),
          where('series', '==', series),
          where('target', 'array-contains', id),
          orderBy('created_at'),
        );

        try {
          const querySnapshot = await getDocs(q);
          const recordList: any = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            recordList.push(data);
          });
          setRecords(recordList);
          setIsLoading(false); // 成功した場合に非同期処理が終了したとマーク
        } catch (error) {
          console.error('Error fetching data:', error);
          setIsLoading(false); // エラーが発生した場合でも非同期処理が終了したとマーク
        }
      };
      searchRecords();
    }
  }, [db, series, id]);

  // Weekly P Growth
  const [totalGrowth, setTotalGrowth] = useState<number>(0);

  // tokenAmountsの初期値をsetsから取得
  const initialTokenKeys = Object.keys(sets).filter((key) =>
    key.startsWith('set_'),
  );

  type TokenAmounts = Record<string, number>;

  const initialTokenAmounts: TokenAmounts = initialTokenKeys.reduce(
    (acc, key) => {
      const tokenKey = key.slice(4);
      acc[tokenKey] = Number(sets[key]);
      return acc;
    },
    {} as TokenAmounts,
  );

  // tokenAmountsを初期化
  const [tokenAmounts, setTokenAmounts] =
    useState<TokenAmounts>(initialTokenAmounts);

  useEffect(() => {
    let newTotalGrowth = 0;
    // 計算
    records.forEach((doc: any) => {
      newTotalGrowth += Number(doc.weekly_p_growth);

      // term1は計算に入れないための処理
      if (doc.term === '1') return;

      for (const token of Object.keys(doc)) {
        if (
          token !== 'weekly_p_growth' &&
          token !== 'series' &&
          token !== 'target' &&
          token !== 'created_at'
        ) {
          const tokenKey = token;
          const decimalPlace = getDecimalPlacesByTokenName(
            tokenKey.toLocaleUpperCase(),
          );
          tokenAmounts[tokenKey] = Number(
            (
              tokenAmounts[tokenKey] +
              tokenAmounts[tokenKey] * doc[token]
            ).toFixed(Number(decimalPlace)),
          );
        }
      }
    });
    setTotalGrowth(newTotalGrowth);
    setTokenAmounts(tokenAmounts);
  }, [records]);

  const weekly_growth = records[records.length - 1]?.weekly_p_growth || 0;

  // シリーズを引数にポートフォリオを作成する
  const selectedPortfolio =
    series !== 'Ultra'
      ? createPortfolio(series)
      : createPortfolioForUltra(tokenAmounts);

  // セット時のETH価格を取得する
  const asset_eth_price = (Number(last_sale_eth_price) * 0.97 * 0.8).toFixed(3);

  // 各トークンの現在価格を計算する
  const calculateCurrentPrice = (amount: number, price: number) =>
    (amount * Number(price)).toFixed(4);

  const currentPrices = Object.entries(tokens).reduce((acc, [key, price]) => {
    const tokenKey = key.slice(0, -5).toLowerCase();
    if (tokenAmounts[tokenKey]) {
      acc[tokenKey] = calculateCurrentPrice(tokenAmounts[tokenKey], price);
    }
    return acc;
  }, {} as Record<string, string>);

  // amountが0よりも多い銘柄が何銘柄あるか数える
  const tokenAmountsArray = Object.values(tokenAmounts).filter(
    (amount) => amount > 0,
  );

  const current_asset_price =
    series === 'Ultra'
      ? selectedPortfolio
          .reduce(
            (sum: number, assetInfo: any) =>
              sum +
              Number(currentPrices[assetInfo.tokenName.toLowerCase()] || 0),
            0,
          )
          .toFixed(0)
      : SERIES_ASSETS[series]
      ? SERIES_ASSETS[series]
          .reduce(
            (sum: number, asset: string | number) =>
              sum + Number(currentPrices[asset] || 0),
            0,
          )
          .toFixed(0)
      : '0';

  // 各トークンの利益、手数料、現在の枚数、手数料を差し引いた枚数を計算したオブジェクト配列を取得する
  const calculatedTokens = calculateTokens(
    current_asset_price,
    last_sale_usd_price,
    tokens,
    tokenAmounts,
    sellingFeeRate,
    tokenAmountsArray,
  );

  //Loading
  const [componentStatus, setComponentStatus] = useState('idle');
  const timerRef = useRef<number | undefined>();

  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
    },
    [],
  );

  const handleClickQuery = () => {
    getRecords();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (componentStatus !== 'idle') {
      setComponentStatus('idle');
      return;
    }

    setComponentStatus('progress');
    timerRef.current = window.setTimeout(() => {
      setComponentStatus('success');
      setChartOpen(true);
    }, 3000);
  };

  //　Requestボタンの処理
  const [requestComponentStatus, setRequestComponentStatus] = useState('idle');
  const timerRefRequest: any = useRef();

  useEffect(
    () => () => {
      clearTimeout(timerRefRequest.current);
    },
    [],
  );

  const handleClickRequestComponentStatus = () => {
    if (timerRefRequest.current) {
      clearTimeout(timerRefRequest.current);
    }

    if (requestComponentStatus !== 'idle') {
      setRequestComponentStatus('idle');
      return;
    }

    setRequestComponentStatus('progress');
    timerRefRequest.current = window.setTimeout(() => {
      setRequestComponentStatus('success');
      handleModalOpen();
      setRequestComponentStatus('idle');
    }, 5000);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);
  const [updated, setUpdated] = useState(false);
  const [alreadyRequest, setAlreadyRequest] = useState(true);

  useEffect(() => {
    // Firestoreからuserdataを読み込み
    const checkRequest = async () => {
      if (!db) return;
      const q = query(
        collection(db, 'purchase-request'),
        where('nft_id', '==', id),
      );
      const querySnapshot = await getDocs(q);
      const checkList = [] as string[];
      querySnapshot.forEach((doc) => {
        checkList.push(doc.data().nft_id);
      });
      if (checkList.includes(id)) {
        setAlreadyRequest(true);
      } else {
        setAlreadyRequest(false);
      }
    };
    checkRequest();
  }, [db, updated]);

  // 売却時のNFT送信先ウォレットアドレス
  const textToCopy = TRANSFER_ADDRESS;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setCopied(true);
        enqueueSnackbar('Successfully copied!', {
          variant: 'success',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right',
          },
          autoHideDuration: 2000,
          TransitionComponent: Slide,
        });
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      },
      (err) => {
        console.log('failed to copy', err.mesage);
      },
    );
  };

  const formik = useFormik({
    initialValues: {
      fee_rate: sellingFeeRate,
      nft_id: id,
      nft_name: name,
      nft_image: image,
      series: series,
      last_sale_eth_price: last_sale_eth_price,
      last_sale_usd_price: last_sale_usd_price,
      current_asset_price: '',
      sold_owner_wallet_address: owner_wallet_address,
      set_date: new Date(created_at),
      sold_date: serverTimestamp(),
      transfered: false,
    },
    onSubmit: async (values: any, helpers) => {
      try {
        if (db) {
          values.current_asset_price = current_asset_price as string;
          values.fee_rate = sellingFeeRate;
          calculatedTokens.forEach((token) => {
            const tokenName = token.tokenName;
            values[`set_${tokenName}`] = initialTokenAmounts[tokenName];
            values[`sold_${tokenName}`] = token.currentAmount;
            values[`without_fee_${tokenName}`] = token.currentAmountWithoutFee;
            values[`fee_${tokenName}`] = token.fee;
          });
          const docRef = doc(collection(db, 'purchase-request'));
          setDoc(docRef, values).then(() => {
            enqueueSnackbar('Successfully Requested!', {
              variant: 'success',
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
              },
              autoHideDuration: 2000,
              TransitionComponent: Slide,
            });
            // Slackに投稿
            fetch('/api/slack', {
              method: 'POST',
              mode: 'same-origin',
              credentials: 'same-origin',
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
              },
              body: JSON.stringify(values),
            }).catch(() => {
              console.log('Failed to send to slack.');
            });
            setModalOpen(false);
            setUpdated(!updated);
            formik.resetForm();
            formik.setStatus({ success: true });
            formik.setSubmitting(false);
          });
        }
      } catch (err) {
        console.error(err);

        if (err instanceof Error) {
          helpers.setStatus({ success: false });
          helpers.setSubmitting(false);
        }
      }
    },
  });

  // ユーティリティ関数: 特定の tokenName に対応する calculatedToken を見つけます。
  const findCalculatedToken = (calculatedTokens: any, tokenName: string) => {
    return calculatedTokens.find(
      (token: { tokenName: string }) =>
        token.tokenName === tokenName.toLowerCase(),
    );
  };

  return (
    <>
      <Card
        sx={{
          background:
            'linear-gradient(180deg,rgba(35,30,33,.8),rgba(21,25,28,.99)),#171a1e',
        }}
      >
        <Grid spacing={0} container>
          <Grid item xs={12} md={4}>
            <Box p={2}>
              <Box>
                <ImageWrapper className="glow-animation">
                  <img src={image} alt="" />
                </ImageWrapper>
                <Box className="details" mt={1}>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h5" noWrap mr={1}>
                      {name}{' '}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      pt: 3,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="h5" gutterBottom noWrap>
                        Staking
                      </Typography>
                      <Typography variant="h5" gutterBottom noWrap>
                        {asset_eth_price} ETH ({last_sale_usd_price} USD)
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="h5" gutterBottom noWrap>
                        Current
                      </Typography>
                      <Typography variant="h5" gutterBottom noWrap>
                        {isLoading ? (
                          <Box mt={1}>
                            <Skeleton
                              variant="rectangular"
                              width={200}
                              height={20}
                            />
                          </Box>
                        ) : (
                          <>{current_asset_price} USD</>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                  {created_at !== null && (
                    <Box
                      sx={{
                        pt: 1,
                      }}
                    >
                      <Typography variant="h5" noWrap>
                        {created_at} -
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Grid mt={2}></Grid>
              </Box>
            </Box>
            <Box
              component="span"
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              <Divider orientation="horizontal" />
            </Box>
            <Box
              p={1}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              <Button onClick={handleOpen}>
                {open ? (
                  <>
                    <span>Close P Growth</span>
                    <KeyboardArrowUpIcon />
                  </>
                ) : (
                  <>
                    <span>See P Growth</span>
                    <KeyboardArrowDownIcon />
                  </>
                )}
              </Button>
            </Box>
          </Grid>
          <Grid
            sx={{
              display:
                open == true
                  ? { xs: 'flex', md: 'flex' }
                  : { xs: 'none', md: 'flex' },
            }}
            position="relative"
            item
            xs={12}
            md={8}
          >
            <Box
              component="span"
              sx={{
                display: { xs: 'none', md: 'inline-block' },
              }}
            >
              <Divider className="divider" absolute orientation="vertical" />
            </Box>
            <Box py={4} pr={4} flex={1}>
              <Grid container spacing={0}>
                <Grid xs={12} sm={6} pl={3} item>
                  <Typography
                    sx={{
                      pb: 3,
                    }}
                    variant="h4"
                  >
                    P Growth
                  </Typography>
                  <Box>
                    {isLoading ? (
                      <Skeleton variant="rectangular" width={200} height={50} />
                    ) : (
                      <Typography variant="h1" gutterBottom>
                        {(totalGrowth * 100).toFixed(6)}%
                      </Typography>
                    )}
                    <Box
                      display="flex"
                      sx={{
                        py: 2,
                      }}
                      alignItems="center"
                    >
                      <AvatarSuccess
                        sx={{
                          mr: 2,
                        }}
                        variant="rounded"
                      >
                        <TrendingUp fontSize="large" />
                      </AvatarSuccess>
                      <Box>
                        {isLoading ? (
                          <Skeleton
                            variant="rectangular"
                            width={100}
                            height={20}
                          />
                        ) : (
                          <Typography variant="h4">
                            {(weekly_growth * 100).toFixed(6)}%
                          </Typography>
                        )}
                        <Typography variant="subtitle2" noWrap>
                          Weekly
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  {!chartOpen && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ height: 40 }}>
                        {componentStatus === 'success' ? (
                          <Typography>Success!</Typography>
                        ) : (
                          <Fade
                            in={componentStatus === 'progress'}
                            style={{
                              transitionDelay:
                                componentStatus === 'progress'
                                  ? '800ms'
                                  : '0ms',
                            }}
                            unmountOnExit
                          >
                            <CircularProgress />
                          </Fade>
                        )}
                      </Box>
                      <Button
                        variant="outlined"
                        onClick={handleClickQuery}
                        sx={{ m: 2 }}
                      >
                        {componentStatus !== 'idle' ? 'Loading' : 'Show chart'}
                      </Button>
                    </Box>
                  )}
                  {chartOpen ? (
                    <Box mr={2} color={'#57CA22'}>
                      <Chart
                        options={areaChartConfig}
                        series={cumulativePGrowthData}
                        type="line"
                      />
                    </Box>
                  ) : (
                    ''
                  )}
                </Grid>
                <Grid xs={12} sm={6} item display="flex">
                  <List
                    disablePadding
                    sx={{
                      width: '100%',
                    }}
                  >
                    {selectedPortfolio.map((item) => {
                      const tokenKey = item.primary.toLowerCase();
                      const tokenAmount = tokenAmounts[tokenKey]
                        ? Number(tokenAmounts[tokenKey]).toFixed(
                            item.numDecimalPlaces,
                          )
                        : '0';

                      if (tokenAmount === '0') return;

                      return (
                        <ListItem disableGutters key={item.id}>
                          <ListItemAvatarWrapper>
                            <img alt="" src={item.image} />
                          </ListItemAvatarWrapper>
                          <ListItemText
                            primary={item.primary}
                            primaryTypographyProps={{
                              variant: 'h5',
                              noWrap: true,
                            }}
                            secondary={item.secondary}
                            secondaryTypographyProps={{
                              variant: 'subtitle2',
                              noWrap: true,
                            }}
                          />
                          <Box>
                            {isLoading ? (
                              <Skeleton
                                variant="rectangular"
                                width={100}
                                height={20}
                              />
                            ) : (
                              <Typography align="right" variant="h4" noWrap>
                                {tokenAmount}
                              </Typography>
                            )}
                          </Box>
                        </ListItem>
                      );
                    })}
                  </List>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Card>

      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{ overflow: 'auto' }}
      >
        <Box sx={style}>
          <Box display="flex" alignItems="center">
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{
                  fontSize: `${theme.typography.pxToRem(15)}`,
                  background: `${theme.colors.alpha.black[10]}`,
                  color: `${theme.colors.alpha.black[70]}`,
                  width: 45,
                  height: 45,
                }}
                alt={name}
                src={image}
              ></Avatar>
            </Box>
            <Box pl={1}>
              <Typography variant="h5">
                {name} - {last_sale_eth_price} {'ETH'} {'('}
                {last_sale_usd_price} {'USD'}
                {')'}
              </Typography>
              <Typography variant="subtitle2" noWrap>
                {created_at} Fee Rate: {(sellingFeeRate * 100).toFixed(1)}%
              </Typography>
            </Box>
          </Box>
          <form onSubmit={formik.handleSubmit}>
            <Box mt={0.5}>
              {selectedPortfolio.map((item) => {
                // item.primary (tokenName) に対応する calculatedToken を見つけます。
                const calculatedToken = findCalculatedToken(
                  calculatedTokens,
                  item.primary,
                );

                // calculatedToken が見つかった場合にはその値を使用し、見つからなかった場合にはデフォルト値を使用します。
                const currentAmount = calculatedToken
                  ? calculatedToken.currentAmount
                  : '0';
                const paymentAmount = calculatedToken
                  ? calculatedToken.paymentAmount
                  : '0';

                if (currentAmount === '0') return;

                return (
                  <ListItem sx={{ py: 0.25 }} disableGutters key={item.id}>
                    <ListItemAvatarWrapper>
                      <img alt="" src={item.image} />
                    </ListItemAvatarWrapper>
                    <ListItemText
                      primary={item.primary}
                      primaryTypographyProps={{
                        variant: 'h5',
                        noWrap: true,
                      }}
                      secondary={item.secondary}
                      secondaryTypographyProps={{
                        variant: 'subtitle2',
                        noWrap: true,
                      }}
                    />
                    <Box>
                      <Typography align="right" noWrap>
                        Current: {currentAmount}
                      </Typography>
                      <Typography align="right" noWrap>
                        Payment: {paymentAmount}
                      </Typography>
                    </Box>
                  </ListItem>
                );
              })}
            </Box>
            <Box textAlign="center">
              <Typography mb={1} textAlign="left">
                Please transfer the NFT to the designated wallet before the
                request.
              </Typography>
              <Button onClick={copyToClipboard} variant="outlined">
                {copied ? 'Copied' : 'Copy Transfer Address'}
              </Button>
            </Box>
            <Box mt={1}>
              <Typography>
                Within 2 weeks after the management team receives the NFT, the
                amount minus 5% as a selling fee will be sent to your designated
                Bybit wallet.
              </Typography>
            </Box>
            <Button
              sx={{
                mt: 1,
              }}
              color="primary"
              type="submit"
              fullWidth
              size="large"
              variant="contained"
            >
              Request for selling
            </Button>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default AssetSellingCard;
