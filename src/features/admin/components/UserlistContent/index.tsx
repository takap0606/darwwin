import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { Box, Card, CardContent, Checkbox, Grid } from '@mui/material';
import SvgIcon from '@mui/material/SvgIcon';
import { alpha, styled } from '@mui/material/styles';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import useFirebase from 'lib/useFirebase';
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
import { REWARD_PERCENTAGE } from 'constants/REWARD_PERCENTAGE';
import { limitMap, rateMap } from 'utils/calculateCompression';
import sumTreeValues from 'utils/sumTreeValues';
import { useRouter } from 'next/router';
import floorDecimal from 'utils/floorDecimal';
import ExcelJS from 'exceljs';

const MinusSquare = (props: any) => {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  );
};

const PlusSquare = (props: any) => {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
    </SvgIcon>
  );
};

const CloseSquare = (props: any) => {
  return (
    <SvgIcon
      className="close"
      fontSize="inherit"
      style={{ width: 14, height: 14 }}
      {...props}
    >
      <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
    </SvgIcon>
  );
};

const StyledTreeItem = styled(
  ({ nodeId, ...props }: { nodeId: string; label: string }) => (
    <TreeItem nodeId={nodeId} {...props} />
  ),
)(({ theme }) => ({
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    whiteSpace: 'noWrap',
  },
}));

const getPeriodDates = (date: Date): { start: Date; end: Date } => {
  const year = date.getFullYear();
  const month = date.getMonth();

  return {
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 0, 23, 59, 59, 999),
  };
};

// 特別報酬対象者の設定
const SPECIAL_REWARDS: Record<string, { rate: number; name: string }> = {
  '0x85276a8cc981791da8592e15f4a47bcbf878a344': {
    rate: 0.03,
    name: 'STATESMAN',
  },
  '0xa7c6b1df071f656f9228441bb67d587eaaeb99b8': { rate: 0.03, name: 'jazz' },
  '0x8007a6077f9356124f302fff76c698ad89493c24': { rate: 0.05, name: 'toshi1' },
  '0xe35ce617fed4f3e75cda40f2e4c6ce56f683ad20': { rate: 0.05, name: 'aikooo' },
};

const UserlistContent = () => {
  const router = useRouter();
  const { db } = useFirebase();
  const userId = router.query.id as string;
  const excelAras: any[] = [];

  const [isDisplayNfts, setIsDisplayNfts] = useState(false);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  const handleDisplayNfts = (event: { target: { checked: any } }) => {
    setIsDisplayNfts(event.target.checked);
  };

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

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const now = new Date();

  const [componentStatus, setComponentStatus] = useState('idle');
  const timerRef = useRef<number>();

  const renderTree = (nodes: any) => {
    nodesArray.push(nodes.id);

    nodes.rateArray = [];
    let childrenLength = 0;
    if (nodes.children) {
      childrenLength = nodes.children.length;
    } else {
      childrenLength = 0;
    }

    const ownedNftLength = nodes.ownedNftLength;
    let childEthVolume = 0;
    nodes.children?.forEach(
      (doc: any) => (childEthVolume += doc.ethSum * REWARD_PERCENTAGE),
    );

    const childrenArray = nodes.children;

    const volume = sumTreeValues(childrenArray, 'usdSum');
    const volumeWithoutFee = Number(volume) * 1.25;

    const nftPoints = nodes.nftPoints;
    const setRate = (Number(nodes.setRate) * 100).toFixed(0);

    let affiliateRewardAmount = 0;
    nodes.children?.forEach(
      (doc: any) =>
        (affiliateRewardAmount +=
          Number(doc.ethSum) * REWARD_PERCENTAGE * Number(nodes.setRate)),
    );

    let compression = 0;

    interface Node {
      rateArray: number[];
      setRate: number;
      children: Node[];
      ethSum: number;
    }

    const compressionCal = (array: Node[], rateArray: number[]): void => {
      array.map((node: Node) => {
        if (rateArray.length > 0) {
          let max = Math.max.apply(null, rateArray);
          if (nodes.setRate > max) {
            compression +=
              (Number(nodes.setRate) - max) *
              REWARD_PERCENTAGE *
              Number(node.ethSum);
            if (node.children.length > 0) {
              node.rateArray = [...rateArray];
              node.rateArray.push(node.setRate);
              compressionCal(node.children, node.rateArray);
            }
          }
        } else {
          node.rateArray = [...rateArray];
          node.rateArray.push(node.setRate);
          compressionCal(node.children, node.rateArray);
        }
      });
    };
    compressionCal(nodes.children, nodes.rateArray);

    const affiliateRewardTotal =
      floorDecimal(affiliateRewardAmount, 4) + floorDecimal(compression, 4);

    let volumeWithoutFeeRateCal = 0;

    const limit = limitMap[setRate] || 15000;

    nodes.children.forEach(
      (doc: { children: never[] | undefined; usdSum: any }) => {
        const totalUsdSum =
          Number(sumTreeValues(doc.children, 'usdSum') + Number(doc.usdSum)) *
          1.25;
        volumeWithoutFeeRateCal += Math.min(totalUsdSum, limit);
      },
    );

    let rate = 0;

    const foundRule = rateMap.find(
      (rule) =>
        volumeWithoutFeeRateCal >= rule.volume && nftPoints >= rule.point,
    );

    if (foundRule) {
      rate = foundRule.rate;
    }

    // 自分自身のethSumと子孫全体のethSumを合計（手数料3%を引いた金額）
    const totalEthVolume =
      (nodes.ethSum + sumTreeValues(nodes.children, 'ethSum')) * 0.97;

    // 特別報酬の計算（対象者のみ）
    const specialReward =
      nodes.id in SPECIAL_REWARDS
        ? totalEthVolume * SPECIAL_REWARDS[nodes.id].rate
        : 0;

    excelAras.push({
      name: nodes.nickname,
      walletAddress: nodes.id,
      setRate: nodes.setRate,
      ownedNftLength: nodes.ownedNftLength,
      totalAra: floorDecimal(affiliateRewardTotal, 3),
      volume: floorDecimal(totalEthVolume, 4),
      specialReward: floorDecimal(specialReward, 3),
    });

    return (
      <StyledTreeItem
        key={nodes.id}
        nodeId={nodes.id ? nodes.id : 'defaultNodeId'}
        label={
          nodes.nickname +
          ' ' +
          '(' +
          childrenLength +
          ')' +
          ' | ' +
          ownedNftLength +
          'NFT' +
          '(' +
          nftPoints +
          'NP' +
          ')' +
          ' | Vol: ' +
          floorDecimal(volumeWithoutFee, 0).toLocaleString() +
          ' ' +
          'USD' +
          ' | ' +
          'Rate:' +
          setRate +
          '%' +
          `${
            getPeriodDates(date).start.getTime() ==
            getPeriodDates(now).start.getTime()
              ? ' | ' +
                'ARA: ' +
                floorDecimal(affiliateRewardTotal, 3) +
                'ETH' +
                ' (DIRECT: ' +
                floorDecimal(affiliateRewardAmount, 3) +
                'ETH' +
                ' , ' +
                'COMP: ' +
                floorDecimal(compression, 3) +
                'ETH)'
              : ''
          }`
        }
      >
        {isDisplayNfts && (
          <Box>
            {nodes.nfts?.map((nft: any, index: number) => (
              <Box key={index}>
                <Box display="flex" my={1}>
                  <img src={nft?.image} width="50px" height="50px" />
                  <Box
                    ml={1}
                    display="block"
                    sx={{
                      opacity: 0.6,
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Typography>{nft?.name}</Typography>
                    </Box>
                    <Typography>
                      {nft?.created_at.toDate().toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
        {Array.isArray(nodes.children)
          ? nodes.children.map((node: any) => renderTree(node))
          : null}
      </StyledTreeItem>
    );
  };

  const [ds, setDs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserAndDescendants = async (invitationCode?: string) => {
    if (db && invitationCode !== undefined && invitationCode !== '') {
      const { start, end } = getPeriodDates(date);
      const usersRef = collection(db, 'users');
      const childrenQuery = query(
        usersRef,
        where('invited_code', '==', invitationCode),
      );
      const childrenSnapshot = await getDocs(childrenQuery);

      const childrenPromises = childrenSnapshot.docs.map(async (childDoc) => {
        const nftsQuery = query(
          collection(db, 'nfts'),
          where('owner_wallet_address', '==', childDoc.id),
          orderBy('created_at'),
          startAt(start),
          endAt(end),
        );
        const nftsSnapshot = await getDocs(nftsQuery);
        const nfts = nftsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        //NFTのETH価格取得
        let ethSum = 0;
        let usdSum = 0;
        let nftPoints = 0;
        let ownedNftLength = 0;

        nftsSnapshot.forEach((doc) => {
          ethSum += Number(doc.data().last_sale_eth_price);
          usdSum += Number(doc.data().last_sale_usd_price);
          nftPoints += Number(doc.data().nft_points);
          ownedNftLength += 1;
        });

        const child: any = {
          ...childDoc.data(),
          id: childDoc.id,
          children: [],
          setRate: childDoc.data().rate,
          nftPoints: nftPoints,
          ethSum: ethSum,
          usdSum: usdSum,
          ownedNftLength: ownedNftLength,
          nfts,
          rateArray: [],
        };
        child.children = await fetchUserAndDescendants(child.invitation_code);
        return child;
      });

      const children = await Promise.all(childrenPromises);
      return children;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (db && userId) {
        const { start, end } = getPeriodDates(date);
        const userSnapshot = await getDoc(doc(collection(db, 'users'), userId));

        const nftsQuery = query(
          collection(db, 'nfts'),
          where('owner_wallet_address', '==', userId),
          orderBy('created_at'),
          startAt(start),
          endAt(end),
        );

        let ethSum = 0;
        let usdSum = 0;
        let nftPoints = 0;
        let ownedNftLength = 0;

        const nftsSnapshot = await getDocs(nftsQuery);

        nftsSnapshot.forEach((doc) => {
          ethSum += Number(doc.data().last_sale_eth_price);
          usdSum += Number(doc.data().last_sale_usd_price);
          nftPoints += Number(doc.data().nft_points);
          ownedNftLength += 1;
        });

        const nfts = nftsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const user: any = {
          ...userSnapshot.data(),
          id: userSnapshot.id,
          children: [],
          nfts,
          setRate: userSnapshot.data()?.rate,
          nftPoints: nftPoints,
          ethSum: ethSum,
          usdSum: usdSum,
          ownedNftLength: ownedNftLength,
          rateArray: [],
        };
        user.children = await fetchUserAndDescendants(
          userSnapshot.data()?.invitation_code,
        );
        setDs(user);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [db, userId, date]);

  let nodesArray: any[] = [];
  const [expanded, setExpanded] = useState<any>([]);

  const handleToggle = (event: any, nodeIds: any[]) => {
    setExpanded(nodeIds);
  };

  const handleExpandClick = () => {
    setExpanded((oldExpanded: any) =>
      oldExpanded.length === 0 ? nodesArray : [],
    );
  };

  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
    },
    [],
  );

  const handleClickQuery = () => {
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
      setOpen(true);
    }, 30000);
  };

  const enterChartUserTotal = () => {
    router.push({
      pathname: `/admin/user/${router.query.id}/total`,
    });
  };

  const handlerClickDownloadButton = async (
    e: { preventDefault: () => void },
    format: string,
  ) => {
    e.preventDefault();

    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet('excelAras');
    const worksheet = workbook.getWorksheet('excelAras');

    if (worksheet === undefined) {
      return;
    }

    worksheet.columns = [
      { header: 'Username', key: 'name' },
      { header: 'Wallet Address', key: 'walletAddress' },
      { header: 'Set Rate', key: 'setRate' },
      { header: 'Nfts', key: 'ownedNftLength' },
      { header: 'ARA', key: 'totalAra' },
      { header: 'Volume (ETH)', key: 'volume' },
      { header: 'Special Reward (ETH)', key: 'specialReward' },
    ];

    worksheet.addRows(excelAras);

    const uint8Array =
      format === 'xlsx'
        ? await workbook.xlsx.writeBuffer()
        : await workbook.csv.writeBuffer();
    const blob = new Blob([uint8Array], { type: 'application/octet-binary' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sampleData.' + format;
    a.click();
    a.remove();
  };

  return (
    <>
      <Head>
        <title>DARWWIN Dashboard - User List</title>
      </Head>
      <Grid
        sx={{ px: 4 }}
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={3}
      >
        <Grid xs={12} sm={12} md={12} mb={4} item>
          <Box
            display="flex"
            alignItems="left"
            justifyContent="space-between"
            sx={{
              py: 3,
            }}
          >
            <Typography variant="h3">User list</Typography>
          </Box>
          <Card sx={{ px: 1 }}>
            <CardContent>
              <Box>Vol: Market Volume - Amount minus Marketplace fees</Box>
              <Box>ARA: Reward Amount</Box>
              <Box>DIRECT: Direct Amount</Box>
              <Box>COMP: Compression Amount</Box>
              <Box mt={1}>
                ※Please select the target month before pressing the "show list"
                button.
              </Box>
              <Box display="flex" alignItems="center">
                <Button disabled={open} onClick={setPrevMonth}>
                  Prev Month
                </Button>
                <Typography>
                  {month}/{year}
                </Typography>
                <Button disabled={open} onClick={setNextMonth}>
                  Next Month
                </Button>
                <Button onClick={enterChartUserTotal}>Total</Button>
              </Box>
              {isLoading ? (
                <Box display="flex" justifyContent="center" my={8}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid
                  sx={{ px: 0, py: 2 }}
                  container
                  direction="row"
                  justifyContent="center"
                  alignItems="stretch"
                >
                  {!open && (
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
                      <Typography color="gray">
                        It takes about 30 seconds.
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={handleClickQuery}
                        sx={{ m: 2 }}
                      >
                        {componentStatus !== 'idle' ? 'Loading' : 'Show list'}
                      </Button>
                    </Box>
                  )}
                  {open ? (
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        onClick={(e) => handlerClickDownloadButton(e, 'xlsx')}
                      >
                        Excel
                      </Button>
                      <Box display="flex" mb={1}>
                        <Button onClick={handleExpandClick}>
                          {expanded.length === 0 ? 'All open' : 'All close'}
                        </Button>
                        <Box display="flex" alignItems="center" mr={3}>
                          <Checkbox
                            checked={isDisplayNfts}
                            onChange={handleDisplayNfts}
                            inputProps={{ 'aria-label': 'Show unsent only' }}
                          />
                          <Typography>Display NFTs</Typography>
                        </Box>
                      </Box>

                      <TreeView
                        aria-label="customized"
                        defaultExpanded={['1']}
                        onNodeToggle={handleToggle}
                        expanded={expanded}
                        defaultCollapseIcon={<MinusSquare />}
                        defaultExpandIcon={<PlusSquare />}
                        defaultEndIcon={<CloseSquare />}
                        sx={{
                          minHeight: 246,
                          flexGrow: 1,
                          overflowY: 'auto',
                          overflowX: 'auto',
                        }}
                      >
                        {ds && renderTree(ds)}
                      </TreeView>
                    </Grid>
                  ) : (
                    ''
                  )}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default UserlistContent;
