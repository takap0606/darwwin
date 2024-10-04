import { Fragment, useState } from 'react';

import {
  Box,
  IconButton,
  Typography,
  Avatar,
  styled,
  useTheme,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  TextareaAutosize,
} from '@mui/material';

import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
import { useFormik } from 'formik';
import Modal from '@mui/material/Modal';
import MoveDownIcon from '@mui/icons-material/MoveDown';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import useFirebase from 'lib/useFirebase';

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

const UltraSeriesCard = ({ nft, setUpdated, updated }: any) => {
  const { db } = useFirebase();
  const theme = useTheme();

  const formikTransfer = useFormik({
    initialValues: {
      from: nft?.owner_wallet_address || '',
      to: '',
      nft_id: nft?.id || '',
      nft_name: nft?.name || '',
      nft_image: nft?.image || '',
    },
    onSubmit: async (values, helpers) => {
      try {
        if (db) {
          // ownerを変更
          const nftRef = doc(db, 'nfts', nft?.uid);
          await setDoc(
            nftRef,
            {
              owner_wallet_address: values.to,
            },
            { merge: true },
          );

          // transferコレクションにトランスファー履歴を追加
          const transferRef = collection(db, 'transfer');
          await addDoc(transferRef, {
            from: values.from,
            to: values.to,
            nft_id: values.nft_id,
            nft_name: values.nft_name,
            nft_image: values.nft_image,
            created_at: serverTimestamp(),
          });
          formikTransfer.resetForm();
          setOpenTransfer(false);
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

  const [openTransfer, setOpenTransfer] = useState(false);
  const handleOpenTransfer = () => setOpenTransfer(true);
  const handleCloseTransfer = () => setOpenTransfer(false);

  const set_date = nft?.created_at
    ? nft?.created_at.toDate().toLocaleDateString('en-US')
    : '';

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      {!open && (
        <Fragment key={nft?.id}>
          <TableBody>
            <TableRow hover>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Avatar
                    sx={{
                      fontSize: `${theme.typography.pxToRem(15)}`,
                      background: `${theme.colors.alpha.black[10]}`,
                      color: `${theme.colors.alpha.black[70]}`,
                      width: 80,
                      height: 80,
                    }}
                    alt=""
                    src={nft?.image}
                  ></Avatar>
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
                    {nft?.name}{' '}
                  </Box>
                  <Typography variant="subtitle2" noWrap>
                    {nft?.owner_wallet_address}
                  </Typography>
                  <Typography variant="subtitle2" noWrap>
                    {set_date}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box>
                  <LabelSuccess>{nft?.series}</LabelSuccess>
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box>
                  <LabelSuccess>{nft?.level}</LabelSuccess>
                </Box>
              </TableCell>
              {nft?.series === 'X' && (
                <TableCell align="center">
                  <Box>
                    <LabelSuccess>{nft?.pa_dividend_rate}</LabelSuccess>
                  </Box>
                </TableCell>
              )}
              <TableCell align="center">
                <Box>
                  <LabelSuccess>{nft?.nft_points}</LabelSuccess>
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box>
                  <LabelSuccess>{nft?.active_status}</LabelSuccess>
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box>
                  <LabelSuccess>{nft?.last_sale_eth_price}</LabelSuccess>
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box>
                  <LabelSuccess>{nft?.last_sale_usd_price}</LabelSuccess>
                </Box>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Box>
                    <Box
                      color="text.primary"
                      sx={{
                        '&:hover': {
                          color: `${theme.colors.primary.main}`,
                        },
                      }}
                    >
                      {nft?.memo}
                    </Box>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Box>
                    <Box
                      color="text.primary"
                      sx={{
                        '&:hover': {
                          color: `${theme.colors.primary.main}`,
                        },
                      }}
                    >
                      {(nft?.set_btc == undefined || nft?.set_btc == '0') &&
                        'Not Operated Yet'}
                    </Box>
                  </Box>
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: 'nowrap',
                }}
                align="center"
              >
                <Box>
                  <IconButton
                    onClick={handleOpenTransfer}
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
                    <MoveDownIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
            <TableRowDivider />
          </TableBody>
        </Fragment>
      )}

      {/* transfer */}
      <Modal
        open={openTransfer}
        onClose={handleCloseTransfer}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form onSubmit={formikTransfer.handleSubmit}>
            <Box display="flex" alignItems="center">
              <Box display="flex" alignItems="center">
                <Avatar
                  sx={{
                    fontSize: `${theme.typography.pxToRem(15)}`,
                    background: `${theme.colors.alpha.black[10]}`,
                    color: `${theme.colors.alpha.black[70]}`,
                    width: 50,
                    height: 50,
                  }}
                  alt=""
                  src={nft?.image}
                ></Avatar>
              </Box>
              <Box pl={1}>
                <Typography color="text.primary">{nft?.name}</Typography>
                <Typography variant="subtitle2" noWrap>
                  {nft?.last_sale_eth_price} {'ETH'} {'('}
                  {nft?.last_sale_usd_price} {'USD'}
                  {')'}
                </Typography>
                <Typography variant="subtitle2" noWrap>
                  {set_date}
                </Typography>
              </Box>
            </Box>
            <Typography variant="subtitle2" noWrap>
              from:{nft?.owner_wallet_address}
            </Typography>
            <TextField
              sx={{
                mb: 1,
              }}
              id="outlined-required"
              fullWidth
              label="to"
              defaultValue=""
              margin="normal"
              name="to"
              onBlur={formikTransfer.handleBlur}
              onChange={formikTransfer.handleChange}
              type="text"
            />

            <Box>
              <IconButton
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
                <MoveDownIcon fontSize="small" />
              </IconButton>
            </Box>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default UltraSeriesCard;
