import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, useTheme, Typography } from '@mui/material';
import AssetControlFormBySeries from 'features/admin/components/AssetControl/AssetControlFormBySeries';
import { collection, getDocs, query, where } from 'firebase/firestore';
import useFirebase from 'lib/useFirebase';
import AssetControlFormUltra from './AssetControlFormUltra';

interface NFT {
  name: string;
  [key: string]: any;
}

const AssetControlForm: React.FC = () => {
  const theme = useTheme();
  const { db } = useFirebase();
  const [currentSeries, setCurrentSeries] = useState<string>('A');
  const [ultraNfts, setUltraNfts] = useState<NFT[]>([]);
  const [currentCheckedNft, setCurrentCheckedNft] = useState<NFT | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [seriesUltra, setSeriesUltra] = useState<boolean>(false);

  const handleSetSeries = (series: string) => {
    setCurrentSeries(series);
    setSeriesUltra(false);
  };

  const handleSetSeriesUltra = (nft: NFT) => {
    setIsLoading(true);
    setCurrentSeries('');
    setSeriesUltra(true);
    setCurrentCheckedNft(nft);
    setIsLoading(false);
  };

  const fetchSeriesUltraRare = async () => {
    if (!db) return;
    try {
      console.log('Fetching series ultra rare');
      const nftsRef = collection(db, 'nfts');
      const q = query(
        nftsRef,
        where('level', '==', 'ultra_rare'),
        where('set_btc', '>', '0'),
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs
        .map((doc) => doc.data() as NFT)
        .filter(
          (nft, index, self) =>
            index === self.findIndex((t) => t.name === nft.name),
        );

      console.log(data);
      setUltraNfts(data);
    } catch (error) {
      console.error('Error fetching ultra rare NFTs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeriesUltraRare();
  }, [db]);

  const renderSeriesSelector = () => (
    <Grid item xs={12} md={12}>
      <Card>
        <Box
          alignItems="center"
          sx={{
            background: theme.colors.alpha.black[5],
          }}
          p={2}
        >
          {['A'].map((series) => (
            <Box
              key={series}
              sx={{
                '&:hover': { cursor: 'pointer' },
              }}
              py={2}
              onClick={() => handleSetSeries(series)}
            >
              <Typography variant="h4">Series {series}</Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </Grid>
  );

  const renderUltraNftSelector = () => (
    <Grid item xs={12} md={12}>
      <Card>
        <Box
          alignItems="center"
          sx={{
            background: theme.colors.alpha.black[5],
            '&:hover': { cursor: 'pointer' },
          }}
          p={2}
        >
          {ultraNfts.map((nftUltra, index) => (
            <Box
              key={index}
              py={2}
              onClick={() => handleSetSeriesUltra(nftUltra)}
            >
              <Typography variant="h4">{nftUltra.name}</Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </Grid>
  );

  return (
    <Grid
      sx={{ px: 4 }}
      container
      direction="row"
      justifyContent="center"
      alignItems="stretch"
      spacing={4}
    >
      <Grid item md={3} xs={12}>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={4}
        >
          {renderSeriesSelector()}
          {renderUltraNftSelector()}
        </Grid>
      </Grid>

      <Grid item md={9} xs={12}>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={4}
        >
          {currentSeries && (
            <Grid item xs={12} md={12}>
              <AssetControlFormBySeries
                key={currentSeries}
                series={currentSeries}
              />
            </Grid>
          )}
          {!isLoading && seriesUltra && (
            <Grid item xs={12} md={12}>
              <AssetControlFormUltra data={currentCheckedNft} />
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default AssetControlForm;
