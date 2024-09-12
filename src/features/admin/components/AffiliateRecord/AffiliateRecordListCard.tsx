import { useEffect, useState } from 'react';

import {
  Box,
  Tooltip,
  IconButton,
  Typography,
  styled,
  useTheme,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
} from '@mui/material';
import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormik } from 'formik';
import Modal from '@mui/material/Modal';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useSnackbar } from 'notistack';
import { Slide } from '@mui/material';
import useFirebase from 'lib/useFirebase';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getPaymentAmount } from 'utils/getPaymentAmount';

const LabelSuccess = styled(Box)(
  ({ theme }) => `
        display: inline-block;
        background: ${theme.colors.success.lighter};
        color: ${theme.colors.success.main};
        text-transform: uppercase;
        font-size: ${theme.typography.pxToRem(11)};
        font-weight: bold;
        padding: ${theme.spacing(1, 2)};
        border-radius: ${theme.general.borderRadiusSm};
        white-space: nowrap;
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

const TableRowDivider = styled(TableRow)(
  ({ theme }) => `
    height: ${theme.spacing(2)};
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

const AffiliateControlListCard = ({ item, updated, setUpdated }: any) => {
  const { db } = useFirebase();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [userInfo, setUserInfo] = useState<any>([]);

  const searchUser = async () => {
    if (db) {
      const userRef = doc(db, 'users', item.wallet_address);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserInfo(userData);
      }
    }
  };

  useEffect(() => {
    searchUser();
  }, [db, open]);

  const formik = useFormik({
    initialValues: {
      bonus_amount: item.bonus_amount,
      wallet_address: item.wallet_address,
      status: item.status,
    },
    onSubmit: async (values, helpers) => {
      try {
        if (db) {
          const affiliateRef = doc(db, 'affiliate', item.uid);

          await updateDoc(affiliateRef, values);

          enqueueSnackbar('Successfully Updated!', {
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

        if (err instanceof Error) {
          helpers.setStatus({ success: false });
          helpers.setSubmitting(false);
        }
      }
    },
  });

  const created_at = new Date(item.created_at).toLocaleDateString();

  // 切り捨て
  function floorDecimal(value: number, n: number) {
    return Math.floor(value * Math.pow(10, n)) / Math.pow(10, n);
  }

  const payment_amount = getPaymentAmount(item.bonus_amount);

  return (
    <>
      <TableBody>
        <TableRow hover>
          <TableCell>
            <Box pl={1}>
              <Button
                disabled={item.status == 'paid'}
                onClick={async () => {
                  try {
                    if (db) {
                      enqueueSnackbar('Successfully Updated!', {
                        variant: 'success',
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'right',
                        },
                        autoHideDuration: 2000,
                        TransitionComponent: Slide,
                      });
                      setOpen(false);
                      setUpdated(!updated);

                      const affiliateRef = doc(db, 'affiliate', item.uid);
                      await updateDoc(affiliateRef, {
                        status: 'paid',
                      });
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                送信完了
              </Button>
            </Box>
          </TableCell>
          <TableCell>
            <Box pl={1}>
              <Typography variant="subtitle2">{created_at}</Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Box pl={1}>
              <Box
                color="text.primary"
                fontWeight="bold"
                sx={{
                  '&:hover': {
                    color: `${theme.colors.primary.main}`,
                  },
                }}
              >
                {userInfo?.nickname}
              </Box>
              <Typography variant="subtitle2">{item.wallet_address}</Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Box pl={1}>
              <Box
                color="text.primary"
                fontWeight="bold"
                sx={{
                  '&:hover': {
                    color: `${theme.colors.primary.main}`,
                  },
                }}
              >
                {userInfo?.pe_username}
              </Box>
              <Typography variant="subtitle2">{userInfo?.pe_email}</Typography>
              <Typography>
                {userInfo?.pe_updated_at
                  ? `最終更新: ${userInfo?.pe_updated_at
                      ?.toDate()
                      .toLocaleDateString('en-US')}`
                  : ''}
              </Typography>
            </Box>
          </TableCell>
          <TableCell align="left">
            <Box fontWeight="bold">{payment_amount}</Box>
          </TableCell>
          <TableCell align="left">
            <Box>
              <LabelSuccess>{item.status}</LabelSuccess>
            </Box>
          </TableCell>
          <TableCell align="left">
            <Box>
              {item.bonus_type == 'partner_reward' && (
                <LabelSuccess>PARTNER REWARD</LabelSuccess>
              )}
              {item.bonus_type == 'fast_bonus' && (
                <LabelSuccess>FAST BONUS</LabelSuccess>
              )}
            </Box>
          </TableCell>
          <TableCell
            sx={{
              whiteSpace: 'nowrap',
            }}
            align="center"
          >
            <Box>
              <Tooltip onClick={handleOpen} title="Edit" arrow>
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
                  <LaunchTwoToneIcon fontSize="small" />
                </IconButtonWrapper>
              </Tooltip>
            </Box>
          </TableCell>
        </TableRow>
        <TableRowDivider />
      </TableBody>

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
                <Box pl={1}>
                  <Typography variant="subtitle2">{created_at}</Typography>
                </Box>
              </Box>
              <TextField
                sx={{
                  mb: 1,
                }}
                id="outlined-required"
                fullWidth
                label="Bonus Amount"
                defaultValue={item.bonus_amount}
                margin="normal"
                name="bonus_amount"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="text"
              />
              <TextField
                sx={{
                  mb: 1,
                }}
                id="outlined-required"
                fullWidth
                label="Wallet Address"
                defaultValue={item.wallet_address}
                margin="normal"
                name="wallet_address"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="text"
              />
              <FormControl
                fullWidth
                sx={{
                  mb: 1,
                }}
              >
                <InputLabel id="demo-simple-select-label">Status</InputLabel>
                <Select
                  name="status"
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="status"
                  onChange={formik.handleChange}
                  defaultValue={item.status}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="applied">Applied</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                </Select>
              </FormControl>

              <Box display="flex" sx={{ justifyContent: 'space-between' }}>
                <Box>
                  <IconButtonWrapper
                    type="submit"
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
                    <SaveIcon fontSize="small" />
                  </IconButtonWrapper>
                </Box>
                <Box
                  onClick={async () => {
                    try {
                      if (db) {
                        enqueueSnackbar('Successfully Deleted!', {
                          variant: 'success',
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          autoHideDuration: 2000,
                          TransitionComponent: Slide,
                        });
                        setOpen(false);
                        setUpdated(!updated);

                        const affiliateRef = doc(db, 'affiliate', item.uid);
                        await deleteDoc(affiliateRef);
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
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
                    <DeleteIcon fontSize="small" />
                  </IconButtonWrapper>
                </Box>
              </Box>
            </form>
          </Box>
        </Modal>
      </>
    </>
  );
};

export default AffiliateControlListCard;
