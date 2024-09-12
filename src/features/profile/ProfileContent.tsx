import Head from 'next/head';
import { useState, useEffect, useContext } from 'react';
import {
  CardHeader,
  Card,
  Box,
  Grid,
  Avatar,
  useTheme,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Divider,
  TextField,
} from '@mui/material';

import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import EditIcon from '@mui/icons-material/Edit';
import Modal from '@mui/material/Modal';
import { useFormik } from 'formik';
import SaveIcon from '@mui/icons-material/Save';
import { Slide } from '@mui/material';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { UserContext } from 'contexts/UserContext';
import useFirebase from 'lib/useFirebase';

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

const ImageWrapper = styled(Box)(
  ({ theme }) => `
        margin: ${theme.spacing(2, 0, 1, -0.5)};
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: ${theme.spacing(1)};
        padding: ${theme.spacing(0.5)};
        border-radius: 100%;
        height: ${theme.spacing(16)};
        width: ${theme.spacing(16)};
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
        height: ${theme.spacing(14)};
        width: ${theme.spacing(14)};
        }
    `,
);

const EditHover = styled(Box)(
  () => `
            position: absolute;
            display: flex;
            background-color: rgba(0, 0, 0, 0.15);
            align-items: center;
            justify-content: center;
            opacity: 0;
            width: 100%;
            height: 100%;
            
            svg {
                font-size: 2rem;
                color: #fff;
            }
              
            &:hover {
            opacity: 1;
            }
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

const ProfileContent = () => {
  const theme = useTheme();
  const { userInfo, setUserInfo } = useContext(UserContext);
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [updated, setUpdated] = useState(false);
  const { db } = useFirebase();

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
  }, [db, userInfo.walletAddress, updated, setUpdated]);

  const startAndEnd = (str: string): string => {
    if (str.length > 35) {
      return `${str.slice(0, 6)}...${str.slice(-4)}`;
    }
    return str;
  };

  let walletAddressEllipsis = '';
  if (userInfo.walletAddress !== undefined) {
    walletAddressEllipsis = startAndEnd(userInfo.walletAddress);
  }

  const updateUserImageData = async (values: any, WALLET_ADDRESS?: string) => {
    if (!WALLET_ADDRESS) {
      console.error('WALLET_ADDRESS is undefined');
      return;
    }

    try {
      if (db) {
        const userDocRef = doc(db, 'users', WALLET_ADDRESS);
        await updateDoc(userDocRef, values);
        console.log('User data updated successfully');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const formik = useFormik({
    initialValues: {
      image_url: '',
    },
    onSubmit: async (values, helpers) => {
      try {
        if (userInfo) {
          updateUserImageData(values, userInfo.walletAddress);
          setOpen(false);
          enqueueSnackbar('Profile Image Changed!', {
            variant: 'success',
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'right',
            },
            autoHideDuration: 2000,
            TransitionComponent: Slide,
          });
          setUpdated(!updated);
        }
      } catch (err) {
        console.error(err);

        helpers.setStatus({ success: false });
        helpers.setErrors({ image_url: (err as Error).message });
        helpers.setSubmitting(false);
      }
    },
  });

  const [editOpen, setEditOpen] = useState(false);
  const handleEditOpen = () => setEditOpen(true);
  const handleEditClose = () => setEditOpen(false);

  const editFormik = useFormik({
    initialValues: {
      pe_username: userInfo?.peUsername,
      pe_email: userInfo?.peEmail,
      pe_updated_at: serverTimestamp(),
    },
    onSubmit: async (values, helpers) => {
      try {
        if (
          db &&
          userInfo.walletAddress !== undefined &&
          userInfo.walletAddress !== ''
        ) {
          const userDocRef = doc(
            collection(db, 'users'),
            userInfo.walletAddress,
          );

          // ログデータの作成
          const logData = {
            type: 'update_profile',
            nickname: userInfo.nickname,
            wallet_address: userInfo.walletAddress,
            old_pe_email: userInfo.peEmail,
            old_pe_username: userInfo.peUsername,
            new_pe_email: values.pe_email,
            new_pe_username: values.pe_username,
            created_at: serverTimestamp(),
          };
          await updateDoc(userDocRef, values);
          // ログコレクションにログデータを追加
          await addDoc(collection(db, 'log'), logData);
          setEditOpen(false);
          enqueueSnackbar('User information Changed!', {
            variant: 'success',
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'right',
            },
            autoHideDuration: 2000,
            TransitionComponent: Slide,
          });
          setUpdated(!updated);
        }
      } catch (err) {
        console.error(err);

        helpers.setStatus({ success: false });
        helpers.setErrors({ pe_email: (err as Error).message });
        helpers.setErrors({ pe_username: (err as Error).message });
        helpers.setSubmitting(false);
      }
    },
  });

  // nfts
  const [nfts, setNfts] = useState<any>([]);

  useEffect(() => {
    const searchNfts = async () => {
      if (
        db &&
        userInfo.walletAddress !== undefined &&
        userInfo.walletAddress !== ''
      ) {
        try {
          const q = query(
            collection(db, 'nfts'),
            where('owner_wallet_address', '==', userInfo.walletAddress),
          );
          const querySnapshot = await getDocs(q);
          const nftList = querySnapshot.docs.map((doc) => ({
            uid: doc.id,
            active_status: doc.data().active_status,
            id: doc.data().id,
            image: doc.data().image,
            name: doc.data().name,
          }));
          setNfts(nftList);
        } catch (err) {
          console.error(err);
        }
      }
    };
    searchNfts();
  }, [db, userInfo.walletAddress, updated]);

  return (
    <>
      <Head>
        <title>DARWWIN Dashboard - My Profile</title>
      </Head>
      <Grid
        sx={{ px: 4, pb: 4 }}
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={3}
      >
        <Grid xs={12} sm={12} md={12} item>
          <Grid
            display="block"
            alignItems="left"
            justifyContent="space-between"
            sx={{
              pt: 3,
            }}
          >
            <ImageWrapper onClick={handleOpen} position="relative">
              <EditHover>
                <EditIcon color="inherit" />
              </EditHover>
              {userInfo.imageUrl !== '' ? (
                <img src={userInfo.imageUrl} alt="profile_image" />
              ) : (
                <img
                  src="/static/images/avatars/sample_avatar.svg"
                  alt="profile_image"
                />
              )}
            </ImageWrapper>
          </Grid>
          <Grid>
            <Typography fontSize={30} fontWeight="bold">
              {userInfo.nickname}
            </Typography>
          </Grid>
          <Grid display="flex" mb={2} alignItems="center">
            <Box display="flex" mr={1}>
              <img src="/static/images/logo/eth.svg" alt="eth" height="16px" />
            </Box>
            <Box mr={2}>
              <Typography fontSize={18}>{walletAddressEllipsis}</Typography>
            </Box>
            <Box>
              <Typography fontSize={18} color="rgb(112, 122, 131)">
                Joined {userInfo.registeredDate}{' '}
              </Typography>
            </Box>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  px: 1,
                  background:
                    'linear-gradient(180deg,rgba(35,30,33,.8),rgba(21,25,28,.99)),#171a1e',
                }}
              >
                <CardHeader
                  sx={{
                    p: 2,
                  }}
                  disableTypography
                  title={
                    <>
                      <Box display="flex" alignItems="center">
                        <Box mr={1} display="flex">
                          <img
                            src="/static/images/logo/paradise-exchange.svg"
                            alt="paradise exchange"
                            height="16px"
                          />
                        </Box>
                        <Typography
                          variant="h4"
                          mr={2}
                          sx={{
                            fontSize: `${theme.typography.pxToRem(16)}`,
                          }}
                        >
                          Paradise Exchange
                        </Typography>
                      </Box>
                    </>
                  }
                  action={
                    <Button
                      onClick={handleEditOpen}
                      size="small"
                      variant="text"
                      endIcon={<ExpandMoreTwoToneIcon />}
                      color="secondary"
                      sx={{
                        backgroundColor: `${theme.colors.secondary.lighter}`,
                        '&:hover': {
                          backgroundColor: `${theme.colors.secondary.main}`,
                          color: `${theme.palette.getContrastText(
                            theme.colors.secondary.main,
                          )}`,
                        },
                      }}
                    >
                      Edit
                    </Button>
                  }
                />
                <Divider />
                <Box
                  p={2}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography fontSize={14}>Username</Typography>
                  <Typography fontSize={14}>
                    {userInfo.peUsername !== undefined
                      ? `${userInfo.peUsername}`
                      : 'Not registered yet.'}
                  </Typography>
                </Box>
                <Box
                  p={2}
                  pt={0}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography fontSize={14}>Email</Typography>
                  <Typography fontSize={14}>
                    {userInfo.peEmail !== undefined
                      ? `${userInfo.peEmail}`
                      : 'Not registered yet.'}
                  </Typography>
                </Box>
              </Card>
            </Grid>
            <Grid item md={8} display="flex">
              <Grid container spacing={2}>
                {nfts.map(({ image }: { image: string }) => {
                  return (
                    <Grid item xs={12} sm={6} md={4} key={image}>
                      <Card
                        variant="outlined"
                        sx={{
                          lineHeight: '0',
                          '& img': {
                            maxWidth: '100%',
                          },
                        }}
                      >
                        <img src={image} alt="" />
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <form onSubmit={formik.handleSubmit}>
              <Box display="flex" alignItems="center">
                <Box>
                  <Grid sx={{ minWidth: 140 }}>
                    <Box my={1}>
                      <Typography variant="h4">Profile Image</Typography>
                    </Box>
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">
                        Select image
                      </InputLabel>
                      <Select
                        name="image_url"
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        label="Profile Image"
                        onChange={formik.handleChange}
                      >
                        {nfts.map(({ image }: { image: string }) => {
                          return (
                            <MenuItem value={image} key={image}>
                              <Avatar
                                sx={{
                                  fontSize: `${theme.typography.pxToRem(15)}`,
                                  background: `${theme.colors.alpha.black[10]}`,
                                  color: `${theme.colors.alpha.black[70]}`,
                                  width: 100,
                                  height: 100,
                                }}
                                src={image}
                                alt=""
                              ></Avatar>
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
                      SAVE
                    </Box>
                    <SaveIcon fontSize="small" />
                  </IconButtonWrapper>
                </IconButton>
              </Box>
            </form>
          </Box>
        </Modal>
      </>

      <>
        <Modal
          open={editOpen}
          onClose={handleEditClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <form onSubmit={editFormik.handleSubmit}>
              <Box display="flex" alignItems="center">
                <Box>
                  <Grid display="flex" sx={{ minWidth: 140 }}>
                    <Typography variant="h4">
                      Paradise Exchange userInfo
                    </Typography>
                  </Grid>
                </Box>
              </Box>
              <TextField
                sx={{
                  mb: 0,
                }}
                id="outlined-required"
                fullWidth
                label="Username"
                margin="normal"
                name="pe_username"
                onBlur={editFormik.handleBlur}
                onChange={editFormik.handleChange}
                type="text"
              />
              <TextField
                sx={{
                  mb: 0,
                }}
                id="outlined-required"
                fullWidth
                label="Email"
                margin="normal"
                name="pe_email"
                onBlur={editFormik.handleBlur}
                onChange={editFormik.handleChange}
                type="text"
              />

              <Box mt={2}>
                <IconButton type="submit">
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
                        SAVE
                      </Box>
                      <SaveIcon fontSize="small" />
                    </IconButtonWrapper>
                  </IconButton>
                </IconButton>
              </Box>
            </form>
          </Box>
        </Modal>
      </>
    </>
  );
};

export default ProfileContent;
