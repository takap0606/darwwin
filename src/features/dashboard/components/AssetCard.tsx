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
  Skeleton,
} from '@mui/material';
import TrendingUp from '@mui/icons-material/TrendingUp';
import { Chart } from 'components/ui/Chart';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import useFirebase from 'lib/useFirebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { AssetCardData, AssetCardProps } from 'features/dashboard/types';
import { createPortfolio } from 'utils/createPortfolio';
import { generateAreaChartConfig } from 'utils/generateAreaChartConfig';
import { getCumulativePGrowthData } from 'utils/getCumulativePGrowthData';
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

const AssetCard = ({
  data,
  tokens,
  isLoading,
  setIsLoading,
}: AssetCardProps) => {
  const { db } = useFirebase();

  const {
    id,
    name,
    image,
    last_sale_eth_price,
    last_sale_usd_price,
    created_at,
    series,
    level,
    ...sets
  } = data as AssetCardData;

  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(!open);
  };

  const [chartData, setChartData] = useState<any>([]);
  const [chartDate, setChartDate] = useState<any>([]);

  const getRecords = async () => {
    if (db) {
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
        // throw e;
        console.log(e);
      }
    }
  };

  // Chart
  const areaChartConfig: any = generateAreaChartConfig(chartDate);
  const cumulativePGrowthData: any = getCumulativePGrowthData(chartData);

  const [chartOpen, setChartOpen] = useState(false);

  const [records, setRecords] = useState<any>([]);

  useEffect(() => {
    let isMounted = true; // コンポーネントのマウント状態を追跡

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

          if (isMounted) {
            setRecords(recordList);
            setIsLoading(false); // 成功した場合に非同期処理が終了したとマーク
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          if (isMounted) {
            setIsLoading(false); // エラーが発生した場合でも非同期処理が終了したとマーク
            // throw new Error((error as Error).message);
          }
        }
      };
      searchRecords();
    }

    // cleanup関数でisMountedを更新して、アンマウント後のsetStateを防ぐ
    return () => {
      isMounted = false;
    };
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
          tokenAmounts[tokenKey] += tokenAmounts[tokenKey] * doc[token];
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
                  <Box mt={1}>
                    <LabelSuccess mr={1}>{series}</LabelSuccess>
                    {level && <LabelSuccess>{level}</LabelSuccess>}
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
                        Invested
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
    </>
  );
};

export default AssetCard;
