import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  List,
  ListItemAvatar,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { Slide } from '@mui/material';
import { useRouter } from 'next/router';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import useFirebase from 'lib/useFirebase';
import {
  CoinType,
  fetchCoinIcon,
  orderPriority,
} from 'features/admin/utils/coinUtils';
import AssetControlSeriesUltraListCard from './AssetControlSeriesUltraListCard';

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .MuiTableCell-root': {
    textTransform: 'none',
    fontWeight: 'normal',
    color: theme.palette.common.black,
    fontSize: theme.typography.pxToRem(16),
    padding: theme.spacing(2),
  },
  '& .MuiTableRow-root': {
    background: 'transparent',
  },
}));

const StyledListItemAvatar = styled(ListItemAvatar)(({ theme }) => ({
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1),
  padding: theme.spacing(0.5),
  borderRadius: '60px',
  marginTop: '16px',
  marginBottom: '8px',
  '& img': {
    background: theme.palette.common.white,
    padding: theme.spacing(0.5),
    display: 'block',
    borderRadius: 'inherit',
    height: theme.spacing(4.5),
    width: theme.spacing(4.5),
  },
}));

interface FormValues {
  [key: string]: string;
  weekly_p_growth: string;
}

interface AssetControlFormUltraProps {
  data: {
    id: string;
    name: string;
    [key: string]: any;
  };
}

const AssetControlFormUltra: React.FC<AssetControlFormUltraProps> = ({
  data,
}) => {
  const { db } = useFirebase();
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const [record, setRecord] = useState<any[]>([]);

  const coins = Object.keys(data)
    .filter(
      (key): key is `set_${CoinType}` =>
        key.startsWith('set_') && Number(data[key]) > 0,
    )
    .map((key) => key.slice(4) as CoinType)
    .sort((a, b) => orderPriority[a] - orderPriority[b]);

  const initialValues: FormValues = {
    ...coins.reduce((acc, coin) => ({ ...acc, [coin]: '' }), {}),
    weekly_p_growth: '',
  };

  const validationSchema = Yup.object().shape({
    ...coins.reduce(
      (acc, coin) => ({
        ...acc,
        [coin]: Yup.string().required(`${coin.toUpperCase()} is required`),
      }),
      {},
    ),
    weekly_p_growth: Yup.string().required('Weekly P Growth is required'),
  });

  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      if (!db) return;
      try {
        await addDoc(collection(db, 'record'), {
          ...values,
          series: 'Ultra',
          target: [data.id],
          created_at: serverTimestamp(),
        });

        enqueueSnackbar('Successfully Recorded!', {
          variant: 'success',
          anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          autoHideDuration: 2000,
          TransitionComponent: Slide,
        });

        resetForm();
        setSubmitting(false);
        router.replace(router.asPath);
      } catch (error) {
        console.error('Error adding document: ', error);
        enqueueSnackbar('Error recording data', { variant: 'error' });
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!db) return;
    const fetchRecords = async () => {
      const q = query(
        collection(db, 'record'),
        where('series', '==', 'Ultra'),
        where('target', 'array-contains', data.id),
        orderBy('created_at', 'desc'),
      );

      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        uid: doc.id,
      }));

      setRecord(records);
      setIsLoading(false);
    };

    fetchRecords();
  }, [data.id, db]);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <>
      <Card>
        <Box p={2}>
          <Typography variant="caption" fontWeight="bold">
            Record Form
          </Typography>
          <Typography variant="h4">Series Ultra - {data.name}</Typography>
        </Box>
        <List>
          <Box px={3} pb={3}>
            <form onSubmit={formik.handleSubmit}>
              {coins.map((coin) => (
                <Box key={coin} display="flex" alignItems="center">
                  <StyledListItemAvatar>
                    <img alt={coin} src={fetchCoinIcon(coin)} />
                  </StyledListItemAvatar>
                  <TextField
                    fullWidth
                    label={coin.toUpperCase()}
                    {...formik.getFieldProps(coin)}
                    error={coin in formik.touched && coin in formik.errors}
                    helperText={
                      coin in formik.touched && coin in formik.errors
                        ? formik.errors[coin]
                        : ''
                    }
                  />
                </Box>
              ))}
              <TextField
                fullWidth
                label="Weekly P Growth"
                {...formik.getFieldProps('weekly_p_growth')}
                error={
                  formik.touched.weekly_p_growth &&
                  Boolean(formik.errors.weekly_p_growth)
                }
                helperText={
                  formik.touched.weekly_p_growth &&
                  formik.errors.weekly_p_growth
                }
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={formik.isSubmitting}
                sx={{ mt: 3 }}
              >
                Set Series Ultra - {data.name}
              </Button>
            </form>
          </Box>
        </List>
      </Card>

      <Card sx={{ mt: 2 }}>
        <Box
          p={2}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="caption" fontWeight="bold">
              Past Record
            </Typography>
            <Typography variant="h4">Series Ultra - {data.name}</Typography>
          </Box>
        </Box>
        <TableContainer>
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell>Record Date</TableCell>
                {coins.map((coin) => (
                  <TableCell key={coin}>{coin.toUpperCase()}</TableCell>
                ))}
                <TableCell>Weekly P Growth</TableCell>
              </TableRow>
            </StyledTableHead>
            {record.map((item) => (
              <AssetControlSeriesUltraListCard key={item.uid} item={item} />
            ))}
          </Table>
        </TableContainer>
      </Card>
    </>
  );
};

export default AssetControlFormUltra;
