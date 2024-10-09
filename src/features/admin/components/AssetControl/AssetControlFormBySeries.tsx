import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';

import {
  Box,
  List,
  Card,
  alpha,
  Typography,
  styled,
  useTheme,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Table,
  TextField,
  Button,
  ListItemAvatar,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import { useSnackbar } from 'notistack';
import { Slide } from '@mui/material';
import useFirebase from 'lib/useFirebase';
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { createPortfolio } from 'utils/createPortfolio';
import AssetControlListCard from './AssetControlListCard';

const useStyles = makeStyles({
  bold: {
    fontWeight: '800!important',
  },
});

const TableWrapper = styled(Table)(
  ({ theme }) => `
  
      thead tr th {
          border: 0;
      }
  
      tbody tr td {
          position: relative;
          border: 0;
  
          & > div {
              position: relative;
              z-index: 5;
          }
  
          &::before {
              position: absolute;
              left: 0;
              top: 0;
              transition: ${theme.transitions.create(['all'])};
              height: 100%;
              width: 100%;
              content: "";
              background: ${theme.colors.alpha.white[100]};
              border-top: 1px solid ${theme.colors.alpha.black[10]};
              border-bottom: 1px solid ${theme.colors.alpha.black[10]};
              pointer-events: none;
              z-index: 4;
          }
  
          &:first-of-type:before {
              border-top-left-radius: ${theme.general.borderRadius};
              border-bottom-left-radius: ${theme.general.borderRadius};
              border-left: 1px solid ${theme.colors.alpha.black[10]};
          }
          
  
          &:last-child:before {
              border-top-right-radius: ${theme.general.borderRadius};
              border-bottom-right-radius: ${theme.general.borderRadius};
              border-right: 1px solid ${theme.colors.alpha.black[10]};
          }
      }
  
      tbody tr:hover td::before {
          background: ${alpha(theme.colors.primary.main, 0.02)};
          border-color: ${alpha(
            theme.colors.alpha.black[100],
            0.25,
          )} !important;
      }
  
    `,
);

const TableHeadWrapper = styled(TableHead)(
  ({ theme }) => `
        .MuiTableCell-root {
            text-transform: none;
            font-weight: normal;
            color: ${theme.colors.alpha.black[100]};
            font-size: ${theme.typography.pxToRem(16)};
            padding: ${theme.spacing(2)};
        }
  
        .MuiTableRow-root {
            background: transparent;
        }
    `,
);

const ListItemAvatarWrapper = styled(ListItemAvatar)(
  ({ theme }) => `
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: ${theme.spacing(1)};
    padding: ${theme.spacing(0.5)};
    border-radius: 60px;
    margin-top: 16px;
    margin-bottom: 8px;
    
    img {
        background: ${theme.colors.alpha.trueWhite[100]};
        padding: ${theme.spacing(0.5)};
        display: block;
        border-radius: inherit;
        height: ${theme.spacing(4.5)};
        width: ${theme.spacing(4.5)};
    }
    `,
);

const AssetControlFormBySeries = ({ series }: { series: string }) => {
  const { db } = useFirebase();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles();

  // シリーズを引数にポートフォリオを作成する
  const seriesAtoJ = ['A'];
  const selectedPortfolio = seriesAtoJ.includes(series)
    ? createPortfolio(series)
    : [];

  const initialValues = selectedPortfolio.reduce(
    (acc, token) => {
      return {
        ...acc,
        [token.tokenName.toLocaleLowerCase()]: '', // 初期値を設定します。ここでは空文字列を使用しています。
      };
    },
    {
      weekly_p_growth: '',
      // term: '',
    },
  );

  const validationSchema = Yup.object().shape(
    selectedPortfolio.reduce(
      (acc, token) => {
        return {
          ...acc,
          [token.tokenName.toLocaleLowerCase()]: Yup.string().required(
            `${token.primary} is required`,
          ),
        };
      },
      {
        weekly_p_growth: Yup.string().required(`Weekly P Growth is required`),
        // term: Yup.string().required(`Term is required`),
      },
    ),
  );

  //過去実績の取得
  const [records, setRecords] = useState<any>([]);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    const searchRecords = async () => {
      if (db) {
        const q = query(
          collection(db, 'record'),
          where('series', '==', series),
          orderBy('created_at', 'desc'),
        );

        const querySnapshot = await getDocs(q);

        const recordList: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          recordList.push({
            uid: doc.id,
            ...data,
          });
        });
        setRecords(recordList);
      }
    };
    searchRecords();
  }, [db, updated, series]);

  type FormikValues = {
    weekly_p_growth: string;
    [key: string]: string;
  };

  return (
    <>
      <Box>
        <Card>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              background: `${theme.colors.alpha.black[5]}`,
            }}
            p={2}
          >
            <Box>
              <Typography
                variant="caption"
                fontWeight="bold"
                sx={{
                  fontSize: `${theme.typography.pxToRem(12)}`,
                }}
              >
                Record Form
              </Typography>
              <Typography variant="h4">Series {series}</Typography>
            </Box>
          </Box>
          <List disablePadding>
            <Box px={3} pb={3}>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (
                  _values: FormikValues,
                  { setErrors, setStatus, setSubmitting, resetForm },
                ) => {
                  try {
                    const fields = Object.keys(initialValues);
                    if (db) {
                      const ref = doc(collection(db, 'record'));
                      const targetList: any[] = [];

                      const q = query(
                        collection(db, 'nfts'),
                        where('series', '==', series),
                        where('active_status', '==', 'inOperation'),
                      );

                      const querySnapshot = await getDocs(q);
                      querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        targetList.push(data.id);
                      });

                      const dataToSubmit = {
                        series: series,
                        target: targetList,
                        created_at: serverTimestamp(),
                        ...fields.reduce(
                          (
                            acc: { [x: string]: any },
                            field: string | number,
                          ) => {
                            acc[field] = _values[field];
                            return acc;
                          },
                          {} as Record<string, any>,
                        ),
                      };

                      await setDoc(ref, dataToSubmit, { merge: true });

                      enqueueSnackbar('Successfully Record!', {
                        variant: 'success',
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'right',
                        },
                        autoHideDuration: 2000,
                        TransitionComponent: Slide,
                      });
                      resetForm();
                      setUpdated(!updated);
                      setStatus({ success: true });
                      setSubmitting(false);
                    }
                  } catch (err) {
                    console.error(err);
                    if (err instanceof Error) {
                      setStatus({ success: false });
                      setSubmitting(false);
                    }
                  }
                }}
              >
                {({
                  errors,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  touched,
                  values,
                }) => (
                  <form noValidate onSubmit={handleSubmit}>
                    {selectedPortfolio.map((item) => {
                      const tokenNameLowercase: string =
                        item.tokenName.toLowerCase();
                      return (
                        <Box display="flex" key={item.id}>
                          <ListItemAvatarWrapper>
                            <img alt="" src={item.image} />
                          </ListItemAvatarWrapper>
                          <TextField
                            error={Boolean(
                              touched[tokenNameLowercase] &&
                                errors[tokenNameLowercase],
                            )}
                            fullWidth
                            helperText={
                              touched[tokenNameLowercase] &&
                              errors[tokenNameLowercase]
                            }
                            label={item.tokenName}
                            margin="normal"
                            name={tokenNameLowercase}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            type="text"
                            value={values[tokenNameLowercase]}
                            variant="outlined"
                          />
                        </Box>
                      );
                    })}

                    <Box display="flex">
                      <TextField
                        error={Boolean(
                          touched.weekly_p_growth && errors.weekly_p_growth,
                        )}
                        fullWidth
                        helperText={
                          touched.weekly_p_growth && errors.weekly_p_growth
                        }
                        label="Weekly P Growth"
                        margin="normal"
                        name="weekly_p_growth"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        value={values.weekly_p_growth}
                        variant="outlined"
                      />
                    </Box>
                    {/* <Box display="flex">
                      <TextField
                        error={Boolean(touched.term && errors.term)}
                        fullWidth
                        helperText={touched.term && errors.term}
                        label="Term"
                        margin="normal"
                        name="term"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="text"
                        value={values.term}
                        variant="outlined"
                      />
                    </Box> */}
                    <Button
                      sx={{
                        mt: 3,
                      }}
                      color="primary"
                      disabled={Boolean(
                        selectedPortfolio.some((item) => {
                          const tokenNameLowercase =
                            item.tokenName.toLowerCase();
                          return (
                            touched[tokenNameLowercase] &&
                            errors[tokenNameLowercase]
                          );
                        }) ||
                          (touched.weekly_p_growth && errors.weekly_p_growth),
                        //  ||
                        // (touched.term && errors.term),
                      )}
                      type="submit"
                      fullWidth
                      size="large"
                      variant="contained"
                    >
                      Set Series {series}
                    </Button>
                  </form>
                )}
              </Formik>
            </Box>
          </List>
        </Card>
      </Box>
      <Box mt={2}>
        <Card>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              background: `${theme.colors.alpha.black[5]}`,
            }}
            p={2}
          >
            <Box>
              <Typography
                variant="caption"
                fontWeight="bold"
                sx={{
                  fontSize: `${theme.typography.pxToRem(12)}`,
                }}
              >
                Past Records
              </Typography>
              <Typography variant="h4">Series {series}</Typography>
            </Box>
          </Box>
          <List disablePadding>
            <Box px={3} pb={3}>
              <TableContainer>
                <TableWrapper>
                  <TableHeadWrapper>
                    <TableRow>
                      <TableCell align="left">
                        <Typography className={classes.bold} noWrap>
                          Record Date
                        </Typography>
                      </TableCell>
                      {selectedPortfolio.map((item) => (
                        <TableCell align="left" key={item.id}>
                          <Typography className={classes.bold} noWrap>
                            {item.tokenName}
                          </Typography>
                        </TableCell>
                      ))}
                      <TableCell align="left">
                        <Typography className={classes.bold} noWrap>
                          Weekly P Growth
                        </Typography>
                      </TableCell>
                      {/* <TableCell align="left">
                        <Typography className={classes.bold} noWrap>
                          Term
                        </Typography>
                      </TableCell> */}
                      <TableCell align="center">
                        <Typography className={classes.bold} noWrap>
                          Edit
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHeadWrapper>
                  {records.map((record: any, index: number) => (
                    <AssetControlListCard
                      record={record}
                      key={index}
                      updated={updated}
                      setUpdated={setUpdated}
                      selectedPortfolio={selectedPortfolio}
                    />
                  ))}
                </TableWrapper>
              </TableContainer>
            </Box>
          </List>
        </Card>
      </Box>
    </>
  );
};

export default AssetControlFormBySeries;
