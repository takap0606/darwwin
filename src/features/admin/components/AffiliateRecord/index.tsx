import {
  alpha,
  Box,
  Button,
  Card,
  Grid,
  List,
  Slide,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import AffiliateRecordList from 'features/admin/components/AffiliateRecord/AffiliateRecordList';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import useFirebase from 'lib/useFirebase';
import { useSnackbar } from 'notistack';
import Papa from 'papaparse';
import { Key, ReactChild, ReactFragment, ReactPortal, useState } from 'react';
import { useDropzone } from 'react-dropzone';

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

const useStyles = makeStyles({
  bold: {
    fontWeight: '800!important',
  },
});

function AffiliateRecord() {
  const theme = useTheme();
  const classes = useStyles();
  const { db } = useFirebase();

  // CSVアップロードの処理
  const [csvData, setCsvData] = useState<any>(null);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const onDrop = (acceptedFiles: any[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const text = event?.target?.result as string;
        const result = Papa.parse(text, { header: true });
        setCsvData(result.data);
        setIsPreviewing(true);
      };

      reader.readAsText(file);
    });
  };

  const handleSave = async () => {
    if (!db) {
      return;
    }
    try {
      await Promise.all(
        csvData.map(
          async (row: {
            bonus_amount: any;
            wallet_address: any;
            set_rate: any;
          }) => {
            const ref = doc(collection(db, 'affiliate'));
            await setDoc(
              ref,
              {
                bonus_type: 'introduction_bonus',
                bonus_amount: row.bonus_amount,
                wallet_address: row.wallet_address,
                set_rate: row.set_rate,
                status: 'pending',
                created_at: Timestamp.now(),
              },
              { merge: true },
            );
          },
        ),
      );
      enqueueSnackbar('Successfully Saved!', {
        variant: 'success',
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right',
        },
        autoHideDuration: 2000,
        TransitionComponent: Slide,
      });
      setCsvData(null);
      setIsPreviewing(false);
    } catch (error) {
      console.error(error);
      alert('Failed to save');
    }
  };

  const handleCancel = () => {
    setCsvData(null);
    setIsPreviewing(false);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <>
      <Grid
        sx={{
          px: 4,
        }}
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={4}
      >
        <Grid item md={12} xs={12}>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="stretch"
            spacing={4}
          >
            <Grid item xs={12} md={12}>
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
                        CSVアップロード
                      </Typography>
                    </Box>
                    <Box>
                      <Box
                        sx={{
                          padding: 1,
                          backgroundColor: theme.colors.alpha.black[5],
                          border: '1px solid ' + theme.colors.alpha.black[10],
                          boxShadow:
                            'inset 0px 1px 1px ' + theme.colors.alpha.black[10],
                          opacity: 1,
                          borderRadius: theme.general.borderRadius,
                        }}
                        {...getRootProps()}
                      >
                        <input {...getInputProps()} />
                        <Typography textAlign="right">
                          ここにCSVファイルをドロップするか、クリックしてファイルを選択してください。
                        </Typography>
                      </Box>
                      {csvData && isPreviewing && (
                        <List disablePadding>
                          <Box px={3} pb={3}>
                            <TableContainer>
                              <TableWrapper>
                                <TableHeadWrapper>
                                  <TableRow>
                                    <TableCell>
                                      <Typography className={classes.bold}>
                                        wallet_address
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography className={classes.bold}>
                                        set_rate
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography className={classes.bold}>
                                        bonus_amount
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                </TableHeadWrapper>
                                <TableBody>
                                  {csvData.map(
                                    (
                                      row: {
                                        wallet_address:
                                          | boolean
                                          | ReactChild
                                          | ReactFragment
                                          | ReactPortal
                                          | null
                                          | undefined;
                                        set_rate:
                                          | boolean
                                          | ReactChild
                                          | ReactFragment
                                          | ReactPortal
                                          | null
                                          | undefined;
                                        bonus_amount:
                                          | boolean
                                          | ReactChild
                                          | ReactFragment
                                          | ReactPortal
                                          | null
                                          | undefined;
                                      },
                                      index: Key | null | undefined,
                                    ) => (
                                      <TableRow hover key={index}>
                                        <TableCell>
                                          <Box pl={1}>{row.wallet_address}</Box>
                                        </TableCell>
                                        <TableCell>
                                          <Box pl={1}>{row.set_rate}</Box>
                                        </TableCell>
                                        <TableCell>
                                          <Box pl={1}>{row.bonus_amount}</Box>
                                        </TableCell>
                                      </TableRow>
                                    ),
                                  )}
                                </TableBody>
                              </TableWrapper>
                            </TableContainer>
                            <Box mt={2} display="flex">
                              <Button onClick={() => handleSave()}>保存</Button>
                              <Button
                                sx={{
                                  ml: 2,
                                }}
                                onClick={() => handleCancel()}
                              >
                                キャンセル
                              </Button>
                            </Box>
                          </Box>
                        </List>
                      )}
                    </Box>
                  </Box>
                </Card>
              </Box>
            </Grid>
            <Grid item xs={12} md={12}>
              <AffiliateRecordList />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default AffiliateRecord;
