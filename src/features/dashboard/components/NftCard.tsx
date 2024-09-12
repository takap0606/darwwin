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
  IconButton,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  useTheme,
} from '@mui/material';
import useFirebase from 'lib/useFirebase';
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { UserContext } from 'contexts/UserContext';
import InvestContext, { InvestContextType } from 'contexts/InvestContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PORTFOLIO_OPTION } from '../constants/PORTFOLIO_OPTION';

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

const IconButtonWrapper = styled(IconButton)(
  ({ theme }) => `
        transition: ${theme.transitions.create(['transform', 'background'])};
        transform: scale(1);
        transform-origin: center;
    
        &:hover {
            transform: scale(1.1);
        }
    `,
);

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  background:
    'linear-gradient(180deg,rgba(35,30,33,.8),rgba(21,25,28,.99)),#171a1e',
};

type Props = {
  id: string;
  name: string;
  image: string;
  last_sale: any;
  platform?: string;
  version?: string;
};

const getPortfolioOptions = (platform?: string, version?: string) => {
  // FIXME
  if (platform === 'opensea' && version === 'luppyclubofficial') {
    return PORTFOLIO_OPTION.filter(
      (portfolio) => portfolio.series >= 'A' && portfolio.series <= 'E',
    );
  } else if (
    (platform === 'opensea' && version === 'crazy-luppy') ||
    platform === 'x2y2'
  ) {
    return PORTFOLIO_OPTION.filter(
      (portfolio) => portfolio.series >= 'F' && portfolio.series <= 'J',
    );
  }
  return [];
};

const NftCard: FC<Props> = ({
  id,
  name,
  image,
  last_sale,
  platform,
  version,
}) => {
  const theme = useTheme();
  const { shouldReload, setShouldReload } =
    useContext<InvestContextType>(InvestContext);
  const { userInfo } = useContext(UserContext);
  const { db } = useFirebase();
  const [alreadySet, setAlreadySet] = useState(false);
  const [open, setOpen] = useState(false);

  const filteredOptions = getPortfolioOptions(platform, version);

  const setNft = () => {
    const values = {
      id: id,
      name: name,
      image: image,
      last_sale_eth_price: last_sale.fixedPrice,
      last_sale_usd_price: last_sale.fixed_usd_base_investment_amount,
      owner_wallet_address: userInfo.walletAddress,
      series: 'None',
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

  // x2y2の場合はシリーズを選択する
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // バリデーションスキーマを定義
  const validationSchema = Yup.object({
    series: Yup.string().required('Series is required'),
    // 他のフィールドに対するバリデーションルールを追加することもできます
  });

  const formik = useFormik({
    initialValues: {
      series: '',
    },
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        if (!db || !userInfo.walletAddress) {
          throw new Error('Database or wallet address not available');
        }

        const nftData = {
          id: id,
          name: name,
          image: image,
          last_sale_eth_price: last_sale.fixedPrice,
          last_sale_usd_price: last_sale.fixed_usd_base_investment_amount,
          owner_wallet_address: userInfo.walletAddress,
          series: values.series,
          platform: platform,
          created_at: serverTimestamp(),
        };

        if (nftData.id != null && db) {
          await addDoc(collection(db, 'nfts'), nftData);
          setShouldReload(!shouldReload);
          setAlreadySet(true);
          setOpen(false);
        }
      } catch (err) {
        console.error(err);

        helpers.setStatus({ success: false });
        helpers.setErrors({ series: (err as Error).message });
        helpers.setSubmitting(false);
      }
    },
  });

  const [isExist, setIsExist] = useState(false);

  useEffect(() => {
    const checkNftExist = async () => {
      if (userInfo.walletAddress !== '' && db) {
        const nftsRef = collection(db, 'nfts');
        const q = query(nftsRef, where('id', '==', id));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          if (doc.exists()) {
            setIsExist(true);
          }
        });
      }
    };
    checkNftExist();
  }, [db]);

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
                        Invested
                      </Typography>
                      <Typography variant="h5" gutterBottom noWrap>
                        {last_sale.fixedPrice} ETH ({' '}
                        {last_sale.fixed_usd_base_investment_amount} USD )
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Grid mt={2}>
                  {isExist ? (
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setNft()}
                      disabled={alreadySet}
                    >
                      {!alreadySet ? 'Set NFT for investing' : 'Already Set'}
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleOpen}
                      disabled={alreadySet}
                    >
                      {!alreadySet ? 'Select Series' : 'Already Set'}
                    </Button>
                  )}
                </Grid>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* シリーズの選択 */}
      <>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <form onSubmit={formik.handleSubmit}>
              <Box>
                <Box>
                  <Grid sx={{ minWidth: 140 }}>
                    <Box my={1}>
                      <Typography variant="h4" mb={2}>
                        Please select a series for your NFT portfolio.
                      </Typography>
                    </Box>
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">
                        Select series
                      </InputLabel>
                      <Select
                        name="series"
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        label="Portfolio series"
                        onChange={formik.handleChange}
                      >
                        {filteredOptions.map((portfolio, index) => {
                          return (
                            <MenuItem
                              value={portfolio.series}
                              key={index}
                              sx={{
                                gap: 1,
                              }}
                            >
                              <Typography
                                fontSize={14}
                                fontWeight="bold"
                                mr={0.5}
                              >
                                {portfolio.series}
                              </Typography>
                              {portfolio.tokens.map((token, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    py: 1,
                                    px: 0.5,
                                    gap: 0.5,
                                  }}
                                >
                                  <Avatar
                                    sx={{
                                      fontSize: `${theme.typography.pxToRem(
                                        15,
                                      )}`,
                                      background: `${theme.colors.alpha.black[10]}`,
                                      color: `${theme.colors.alpha.black[70]}`,
                                      width: 20,
                                      height: 20,
                                    }}
                                    src={token.image}
                                    alt=""
                                  />
                                  <Typography fontSize={8}>
                                    {token.name}
                                  </Typography>
                                </Box>
                              ))}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                </Box>
              </Box>

              <Box mt={2}>
                <IconButton type="submit">
                  <IconButtonWrapper
                    sx={{
                      backgroundColor: `${theme.colors.primary.lighter}`,
                      color: `${theme.colors.primary.main}`,
                      transition: `${theme.transitions.create(['all'])}`,

                      '&:hover': {
                        backgroundColor: `${theme.colors.primary.main}`,
                        color: `${theme.palette.getContrastText(
                          theme.colors.primary.main,
                        )}`,
                      },
                    }}
                  >
                    <Box fontSize={16} fontWeight="bold" px={1}>
                      Set NFT for investing
                    </Box>
                  </IconButtonWrapper>
                </IconButton>
              </Box>
            </form>
          </Box>
        </Modal>
      </>
    </>
  );
};

export default NftCard;
