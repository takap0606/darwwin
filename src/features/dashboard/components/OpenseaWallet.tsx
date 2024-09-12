import {
  Button,
  Card,
  Grid,
  Box,
  CardContent,
  Avatar,
  Tooltip,
  CardActionArea,
  styled,
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { UserContext } from 'contexts/UserContext';
import NftList from 'features/dashboard/components/NftList';
import { collection, getDocs, query, where } from 'firebase/firestore';
import useFirebase from 'lib/useFirebase';
import Loader from 'components/common/Loader';
import {
  calculateOpenSeaPricing,
  calculateX2Y2Pricing,
} from '../utils/calculatePricing';

const AvatarAddWrapper = styled(Avatar)(
  ({ theme }) => `
            background: ${theme.colors.alpha.black[10]};
            color: ${theme.colors.primary.main};
            width: ${theme.spacing(8)};
            height: ${theme.spacing(8)};
    `,
);

const CardAddAction = styled(Card)(
  ({ theme }) => `
            border: ${theme.colors.primary.main} dashed 1px;
            height: 100%;
            color: ${theme.colors.primary.main};
            transition: ${theme.transitions.create(['all'])};
            
            .MuiCardActionArea-root {
              height: 100%;
              justify-content: center;
              align-items: center;
              display: flex;
            }
            
            .MuiTouchRipple-root {
              opacity: .2;
            }
            
            &:hover {
              border-color: ${theme.colors.alpha.black[70]};
            }
    `,
);

function OpenseaWallet({ tokens }: any) {
  const router = useRouter();
  const { db } = useFirebase();
  const { userInfo } = useContext(UserContext);

  const handleMoveX2Y2Store = () => {
    // FIXME: X2Y2に変更する
    router.push('https://x2y2.io/collection/bitbull-3/items');
  };

  const [nftListData, setNftListData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);

  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'X-API-KEY': process.env.NEXT_PUBLIC_OPENSEA_API || '',
    },
  };

  const WALLET_ADDRESS = '0x091D4e4BAC946fD9564710D7eCDed83Ca808e606';

  // const WALLET_ADDRESS = userInfo.walletAddress || '';

  useEffect(() => {
    if (WALLET_ADDRESS !== '' && db) {
      setIsLoading(true);
      const fetchData = async () => {
        try {
          const openSeaCollectionSlugs = [''];

          const x2y2CollectionSlugs = [
            '0xf532e895f1fb80ce4bc1bb88c2887d35e764c5d4', // BITBULL
            // '0x1180f09c2f76924280cb54ae205efa7b06c03c04', // TEST
          ];

          let openSeaAssets: any[] = [];

          if (process.env.NEXT_PUBLIC_OPENSEA_API) {
            const openSeaRequests = openSeaCollectionSlugs.map((slug) =>
              axios.get(
                `https://api.opensea.io/api/v2/chain/ethereum/account/${WALLET_ADDRESS}/nfts?collection=${slug}`,
                options,
              ),
            );

            const openSeaResponses = await Promise.all(openSeaRequests);
            openSeaAssets = openSeaResponses.flatMap(
              (response) => response.data.nfts,
            );
          }

          const x2y2Requests = x2y2CollectionSlugs.map((slug) =>
            axios.get(
              `https://api.reservoir.tools/users/${WALLET_ADDRESS}/tokens/v7?collection=${slug}&includeAttributes=true&includeLastSale=true`,
              options,
            ),
          );

          const x2y2Responses = await Promise.all(x2y2Requests);
          const x2y2Assets = x2y2Responses.flatMap(
            (response) => response.data.tokens,
          );

          // OpenSea specific processing if assets were fetched
          let resolvedOpenSeaAssets: any[] = [];
          if (openSeaAssets.length > 0) {
            const fetchLastSaleEvent = async (asset: {
              contract: any;
              identifier: any;
            }) => {
              const eventsUrl = `https://api.opensea.io/api/v2/events/chain/ethereum/contract/${asset.contract}/nfts/${asset.identifier}?event_type=sale`;
              const eventsResponse = await axios.get(eventsUrl, options);
              const saleEvents = eventsResponse.data.asset_events.filter(
                (event: { event_type: string }) => event.event_type === 'sale',
              );

              const latestSaleEvent = saleEvents.reduce(
                (
                  latest: { event_timestamp: number },
                  event: { event_timestamp: number },
                ) =>
                  latest.event_timestamp > event.event_timestamp
                    ? latest
                    : event,
                saleEvents[0] || {},
              );

              return latestSaleEvent;
            };

            const normalizedOpenSeaAssetsPromises = openSeaAssets.map(
              async (asset) => {
                const last_sale = await fetchLastSaleEvent(asset);
                return {
                  id: asset.identifier,
                  platform: 'opensea',
                  pricing: calculateOpenSeaPricing(last_sale, tokens),
                  ...asset,
                };
              },
            );

            resolvedOpenSeaAssets = await Promise.all(
              normalizedOpenSeaAssetsPromises,
            );
          }

          const normalizedX2y2Assets = x2y2Assets.map((asset) => ({
            id: asset.token.tokenId,
            identifier: asset.token.tokenId,
            image_url: asset.token.image,
            platform: 'x2y2',
            pricing: calculateX2Y2Pricing(asset.token.lastSale),
            ...asset.token,
          }));

          // Firestore filtering
          const filterAssets = async (assets: any[]) => {
            const filteredAssetsPromises = assets.map(async (asset) => {
              if (!userInfo.walletAddress || !asset.id) {
                console.error(
                  'Undefined field: ',
                  !userInfo.walletAddress ? 'walletAddress' : 'assetId',
                );
                return null;
              }
              const nftsRef = query(
                collection(db, 'nfts'),
                where('owner_wallet_address', '==', userInfo.walletAddress),
                where('id', '==', asset.id),
              );
              const snapshot = await getDocs(nftsRef);
              return snapshot.empty ? asset : null;
            });

            return (await Promise.all(filteredAssetsPromises)).filter(
              (asset) => asset !== null,
            );
          };

          const [filteredOpenSeaAssets, filteredX2y2Assets] = await Promise.all(
            [
              filterAssets(resolvedOpenSeaAssets),
              filterAssets(normalizedX2y2Assets),
            ],
          );

          setNftListData([...filteredOpenSeaAssets, ...filteredX2y2Assets]);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
        setIsLoading(false);
      };
      fetchData();
    }
  }, [userInfo, db]);

  if (isLoading) return <Loader />;

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          pb: 3,
        }}
      >
        <Box display="flex">
          <Button onClick={handleMoveX2Y2Store} size="small" variant="outlined">
            {'Buy v1 NFTs'}
          </Button>
        </Box>
      </Box>
      <Grid container spacing={3}>
        <NftList nftListData={nftListData} tokens={tokens} />
        <Grid xs={12} sm={6} md={3} item>
          <Tooltip
            arrow
            title={'Click to add a new NFT'}
            onClick={handleMoveX2Y2Store}
          >
            <CardAddAction>
              <CardActionArea
                sx={{
                  px: 1,
                }}
              >
                <CardContent>
                  <AvatarAddWrapper>
                    <AddTwoToneIcon fontSize="large" />
                  </AvatarAddWrapper>
                </CardContent>
              </CardActionArea>
            </CardAddAction>
          </Tooltip>
        </Grid>
      </Grid>
    </>
  );
}

export default OpenseaWallet;
