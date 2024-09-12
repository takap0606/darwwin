import { useState } from 'react';
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
  Button,
  TableBody,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import { useSnackbar } from 'notistack';
import { Slide } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import useFirebase from 'lib/useFirebase';

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

function NftUpdateDataDropzone() {
  const { db } = useFirebase();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles();

  // CSVアップロードの処理
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [length, setLength] = useState(0);

  const onDrop = (acceptedFiles: any[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onload = async (event: any) => {
        const text = event.target.result;
        const result = Papa.parse(text, { header: true });
        setCsvData(result.data);
        setIsPreviewing(true);
        setLength(result.data.length);
      };

      reader.readAsText(file);
    });
  };

  const handleSave = async () => {
    try {
      if (db && csvData) {
        await Promise.all(
          csvData.map(async (row: { [x: string]: any; id?: any }) => {
            const q = query(collection(db, 'nfts'), where('id', '==', row.id));
            const querySnapshot = await getDocs(q);

            // 検索結果の最初のドキュメントに対して更新処理を実行
            if (!querySnapshot.empty) {
              const document = querySnapshot.docs[0]; // 最初のドキュメント
              // CSVヘッダー（キー）を元に更新データオブジェクトを構築
              const updateData: { [key: string]: any } = {};

              Object.keys(row).forEach((key) => {
                // 'id' キーは除外
                if (key !== 'id') {
                  updateData[key] = row[key];
                }
              });

              // 更新データにタイムスタンプを追加
              updateData['pdt_allocation_date'] = serverTimestamp();

              // ドキュメントを更新
              await updateDoc(document.ref, updateData);
            } else {
              console.log('Document not found:', row.id);
            }
          }),
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
      }
    } catch (error) {
      console.error(error);
      alert('保存に失敗しました。');
    }
  };

  const handleCancel = () => {
    setCsvData(null);
    setIsPreviewing(false);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

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
                    <Typography variant="h6">{length}件</Typography>
                    <TableContainer>
                      <TableWrapper>
                        <TableHeadWrapper>
                          <TableRow>
                            {Object.keys(csvData[0]).map((header, index) => (
                              <TableCell key={index}>
                                <Typography className={classes.bold}>
                                  {header}
                                </Typography>
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHeadWrapper>
                        <TableBody>
                          {csvData.map((row, rowIndex) => (
                            <TableRow hover key={rowIndex}>
                              {Object.values(row).map((value, valueIndex) => (
                                <TableCell key={valueIndex}>
                                  <Box pl={1}>{value}</Box>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </TableWrapper>
                    </TableContainer>
                    <Box mt={2} display="flex">
                      <Box mr={2}>
                        <Button onClick={() => handleSave()}>保存</Button>
                      </Box>
                      <Box>
                        <Button onClick={() => handleCancel()}>
                          キャンセル
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </List>
              )}
            </Box>
          </Box>
        </Card>
      </Box>
    </>
  );
}

export default NftUpdateDataDropzone;
