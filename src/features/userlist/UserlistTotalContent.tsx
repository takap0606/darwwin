import Head from 'next/head';
import { useState, useEffect, useRef, useContext } from 'react';
import { Box, Card, CardContent, Checkbox, Grid } from '@mui/material';
import SvgIcon from '@mui/material/SvgIcon';
import { alpha, styled } from '@mui/material/styles';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { UserContext } from 'contexts/UserContext';
import useFirebase from 'lib/useFirebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { REWARD_PERCENTAGE } from 'constants/REWARD_PERCENTAGE';
import { limitMap, rateMap } from 'utils/calculateCompression';
import sumTreeValues from 'utils/sumTreeValues';
import floorDecimal from 'utils/floorDecimal';

const MinusSquare = (props: any) => {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  );
};

const PlusSquare = (props: any) => {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
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
      {/* tslint:disable-next-line: max-line-length */}
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

const UserlistTotalContent = () => {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const { db } = useFirebase();

  const [isDisplayNfts, setIsDisplayNfts] = useState(false);

  const handleDisplayNfts = (event: { target: { checked: any } }) => {
    setIsDisplayNfts(event.target.checked);
  };

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
  }, [db, userInfo.walletAddress]);

  //ここから
  const [open, setOpen] = useState(false);
  const renderTree = (nodes: any) => {
    //全てを開閉するためのnodesArrayに追加
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

    let directChildVolume = 0;
    nodes.children.forEach(
      (doc: { usdSum: any }) =>
        (directChildVolume += Number(doc.usdSum) * 1.25),
    );

    //ここからcompression計算
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

    //還元率計算
    let rate = 0;

    const foundRule = rateMap.find(
      (rule) =>
        volumeWithoutFeeRateCal >= rule.volume && nftPoints >= rule.point,
    );

    if (foundRule) {
      rate = foundRule.rate;
    }

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
          ' | ' +
          'VCRP: ' +
          volumeWithoutFeeRateCal.toLocaleString() +
          ' USD | DirectVol: ' +
          directChildVolume.toLocaleString() +
          ' USD'
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

  // ユーザー情報と子孫を取得する
  const fetchUserAndDescendants = async (invitationCode?: string) => {
    if (db && invitationCode !== undefined && invitationCode !== '') {
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

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (
        db &&
        userInfo.walletAddress !== '' &&
        userInfo.invitationCode !== ''
      ) {
        const userSnapshot = await getDoc(
          doc(collection(db, 'users'), userInfo.walletAddress),
        );

        const nftsQuery = query(
          collection(db, 'nfts'),
          where('owner_wallet_address', '==', userInfo.walletAddress),
          orderBy('created_at'),
        );

        //NFTのETH価格取得
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
        user.children = await fetchUserAndDescendants(userInfo.invitationCode);
        setDs(user);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [db, userInfo.walletAddress, userInfo.invitationCode]);

  const [componentStatus, setComponentStatus] = useState('idle');
  const timerRef = useRef<number>();

  //全てを開く
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

  return (
    <>
      <Head>
        <title>DARWWIN Dashboard - User List Total</title>
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
          <Card
            sx={{
              px: 1,
              background:
                'linear-gradient(180deg,rgba(35,30,33,.8),rgba(21,25,28,.99)),#171a1e',
            }}
          >
            <CardContent>
              <Box>
                NP: NFT Points / Common(1), Uncommon(5), Rare(10), Super
                Rare(30), Ultra Rare(100)
              </Box>
              <Box>Vol: Market Volume - Amount minus Opensea fees</Box>
              <Box>VCRP: Volume for calculation of reward percentage </Box>
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
                              componentStatus === 'progress' ? '800ms' : '0ms',
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

                    {isLoading ? (
                      <Box display="flex" justifyContent="center" my={8}>
                        <CircularProgress />
                      </Box>
                    ) : (
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
                    )}
                  </Grid>
                ) : (
                  ''
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default UserlistTotalContent;
