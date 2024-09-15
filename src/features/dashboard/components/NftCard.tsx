import React, { FC, useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  styled,
  Typography,
  Card,
  CardContent,
  alpha,
  useTheme,
} from '@mui/material';
import useFirebase from 'lib/useFirebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { UserContext } from 'contexts/UserContext';
import InvestContext, { InvestContextType } from 'contexts/InvestContext';

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

type Props = {
  id: string;
  name: string;
  image: string;
  last_sale: any;
  platform?: string;
  version?: string;
};

const NftCard: FC<Props> = ({
  id,
  name,
  image,
  last_sale,
  platform,
  version,
}) => {
  const { shouldReload, setShouldReload } =
    useContext<InvestContextType>(InvestContext);
  const { userInfo } = useContext(UserContext);
  const { db } = useFirebase();
  const [alreadySet, setAlreadySet] = useState(false);
  const [level, setLevel] = useState('');
  const [nftPoint, setNftPoint] = useState('');

  const checkRarity = () => {
    // #で区切り、前半部分を取得し、スペースを正規化
    const namePrefix = name.split('#')[0].trim().replace(/\s+/g, ' ');

    if (namePrefix.startsWith('BITBULL')) {
      setLevel('common');
      setNftPoint('1');
    } else if (namePrefix.startsWith('CYBER PUNK BULL')) {
      setLevel('uncommon');
      setNftPoint('5');
    } else if (namePrefix.startsWith('GOLD BULL')) {
      setLevel('rare');
      setNftPoint('10');
    } else if (namePrefix.startsWith('BLACK GOLD BULL')) {
      setLevel('super_rare');
      setNftPoint('30');
    } else {
      setLevel('');
      setNftPoint('');
    }
  };

  console.log('level', level);
  console.log('name', name);

  const setNft = () => {
    const values = {
      id: id,
      name: name,
      image: image,
      last_sale_eth_price: last_sale.fixedPrice,
      last_sale_usd_price: last_sale.fixed_usd_base_investment_amount,
      owner_wallet_address: userInfo.walletAddress,
      series: 'A',
      level: level,
      nft_points: nftPoint,
      platform: platform,
      created_at: serverTimestamp(),
    };

    if (values.id != null && db) {
      addDoc(collection(db, 'nfts'), values);
      setShouldReload(!shouldReload);

      setAlreadySet(true);
    } else {
      return;
    }
  };

  useEffect(() => {
    checkRarity();
  }, []);

  return (
    <>
      <Grid xs={12} sm={6} md={3} item>
        <Card
          sx={{
            background:
              'linear-gradient(180deg,rgba(35,30,33,.8),rgba(21,25,28,.99)),#171a1e',
          }}
        >
          <CardContent>
            {level}
            <br />
            {name}
            <Box>
              <Box>
                <ImageWrapper>
                  <img src={image} alt="" />
                </ImageWrapper>
                <Box className="details" mt={1}>
                  <Typography variant="h5" noWrap>
                    {name}
                  </Typography>
                  <Box mt={1}>
                    <LabelSuccess>
                      {platform == 'x2y2' ? 'X2Y2' : 'OpenSea'}
                    </LabelSuccess>
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
                        {last_sale.fixedPrice} ETH ({' '}
                        {last_sale.fixed_usd_base_investment_amount} USD )
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Grid mt={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setNft()}
                    disabled={alreadySet}
                  >
                    {!alreadySet ? 'Set NFT for investing' : 'Already Set'}
                  </Button>
                </Grid>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};

export default NftCard;
