import { useState } from 'react';

import {
  Box,
  Typography,
  styled,
  Button,
  Divider,
  ListItem,
} from '@mui/material';
import Modal from '@mui/material/Modal';
import { useSnackbar } from 'notistack';
import { Slide } from '@mui/material';
import useFirebase from 'lib/useFirebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { useFormik } from 'formik';

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

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 380,
  bgcolor: 'background.paper',
  border: '1px solid #CBCCD2',
  borderRadius: '10px',
  boxShadow: 24,
  p: 4,
  background:
    'linear-gradient(180deg,rgba(35,30,33,.8),rgba(21,25,28,.99)),#171a1e',
};

const ReportsListCard = ({ item, updated, setUpdated }: any) => {
  const { db } = useFirebase();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      status: item.status,
    },
    onSubmit: async (values, helpers) => {
      try {
        if (db) {
          const ref = doc(collection(db, 'affiliate'), item.uid);
          await updateDoc(ref, {
            status: 'applied',
          });
          enqueueSnackbar('Successfully Applied', {
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
        }
      } catch (err) {
        console.error(err);

        if (err instanceof Error) {
          helpers.setStatus({ success: false });
          helpers.setErrors({ status: (err as Error).message });
          helpers.setSubmitting(false);
        }
      }
    },
  });

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Divider />
      <ListItem
        sx={{
          justifyContent: 'space-between',
          display: { xs: 'block', sm: 'flex' },
          py: 3,
          px: 2.5,
        }}
      >
        <Box>
          <Typography>
            {' '}
            {item.created_at} - Rate: {Number(item.set_rate * 100).toFixed(0)}%
          </Typography>
          <Typography fontWeight="bold" my={{ xs: 2, sm: 1 }}>
            {item.bonus_type == 'introduction_bonus' && 'Introduction Bonus'}
            {item.bonus_type == 'capital_bonus' && 'Capital Bonus'}
            {item.bonus_type == 'sharing_bonus' && 'Sharing Bonus'}
          </Typography>
          <LabelSuccess mt={{ xs: 0, sm: 1 }} mb={{ xs: 2, sm: 0 }}>
            {item.status}
          </LabelSuccess>
        </Box>
        <Box>
          <Box>
            <Typography fontWeight="bold">
              Bonus Amount: {Number(item.bonus_amount).toFixed(3)} ETH
            </Typography>
          </Box>
          <Box mt={2} textAlign={{ xs: 'left', sm: 'right' }}>
            {item.status == 'applied' && (
              <Button variant="outlined" disabled={item.status == 'applied'}>
                REQUESTED
              </Button>
            )}
            {item.status == 'pending' && (
              <Button onClick={handleOpen} variant="outlined">
                WITHDRAWAL REQUEST
              </Button>
            )}
          </Box>
        </Box>
      </ListItem>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form onSubmit={formik.handleSubmit}>
            <Box mb={1}>
              <Typography>{item.created_at}</Typography>
              <LabelSuccess my={1}>
                {item.bonus_type == 'introduction_bonus' &&
                  'Introduction Bonus'}
                {item.bonus_type == 'capital_bonus' && 'Capital Bonus'}
                {item.bonus_type == 'sharing_bonus' && 'Sharing Bonus'}
              </LabelSuccess>
            </Box>
            <Box>
              <Box>
                <Typography fontWeight="bold">
                  Bonus Amount: {Number(item.bonus_amount).toFixed(3)} ETH
                </Typography>
              </Box>
            </Box>

            <Box my={2}>
              <Typography>Disclaimer:</Typography>
              <Typography>
                Please note that affiliate rewards minus 5% as a withdrawal fee
                will be sent to your designated Bybit wallet. Requests made by
                the 10th will be processed on the 15th. Requests after the 11th
                will be processed on the 15th of the following month.
              </Typography>
            </Box>

            <Box display="flex" sx={{ justifyContent: 'space-between' }}>
              <Button variant="outlined" type="submit">
                SUBMIT WITHDRAWAL REQUEST
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default ReportsListCard;
