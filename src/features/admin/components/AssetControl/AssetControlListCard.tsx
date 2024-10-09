import { Fragment, useState } from 'react';

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
} from '@mui/material';
import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { useFormik } from 'formik';
import Modal from '@mui/material/Modal';
import { doc, updateDoc } from 'firebase/firestore';
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

const AssetControlListCard = ({
  record,
  selectedPortfolio,
  updated,
  setUpdated,
}: any) => {
  const { db } = useFirebase();
  const theme = useTheme();

  // selectedPortfolioからデータを抽出して新たなオブジェクトを作成
  const initialValues = selectedPortfolio.reduce(
    (acc: { [x: string]: any }, item: { tokenName: string }) => {
      const key = item.tokenName.toLocaleLowerCase(); // set_btc、set_ethなど
      acc[key] = record ? record[key] : '';
      return acc;
    },
    { weekly_p_growth: record.weekly_p_growth },
  );

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: async (values, helpers) => {
      try {
        if (db) {
          const recordRef = doc(db, 'record', record.uid);
          await updateDoc(recordRef, values);
          setOpen(false);
          setUpdated(!updated);
          formik.resetForm();
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

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      {!open && (
        <>
          <Fragment>
            <TableBody>
              <TableRow hover>
                <TableCell>
                  <Box pl={1}>
                    <Typography variant="subtitle2" noWrap>
                      {record.created_at.toDate().toLocaleDateString()}
                    </Typography>
                  </Box>
                </TableCell>
                {selectedPortfolio.map((item: any, index: number) => (
                  <TableCell align="left" key={index}>
                    <Box>
                      <LabelSuccess>
                        {record[item.tokenName.toLocaleLowerCase()]}
                      </LabelSuccess>
                    </Box>
                  </TableCell>
                ))}
                <TableCell align="left">
                  <Box>
                    <LabelSuccess>{record.weekly_p_growth}</LabelSuccess>
                  </Box>
                </TableCell>
                {/* <TableCell align="left">
                  <Box>
                    <LabelSuccess>{record.term}</LabelSuccess>
                  </Box>
                </TableCell> */}
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
          </Fragment>
        </>
      )}

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
                  <Typography variant="subtitle2" noWrap>
                    {record.created_at.toDate().toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
              {selectedPortfolio.map((item: any, index: number) => {
                const tokenNameLowercase: string = item.tokenName.toLowerCase();
                return (
                  <Box key={index}>
                    <TextField
                      fullWidth
                      label={item.tokenName}
                      margin="normal"
                      name={tokenNameLowercase}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="text"
                      value={formik.values[tokenNameLowercase]}
                      variant="outlined"
                      error={Boolean(
                        formik.touched[tokenNameLowercase] &&
                          formik.errors[tokenNameLowercase],
                      )}
                    />
                  </Box>
                );
              })}
              <TextField
                sx={{
                  mb: 1,
                }}
                id="outlined-required"
                fullWidth
                label="Weekly P Growth"
                defaultValue={record.weekly_p_growth}
                margin="normal"
                name="weekly_p_growth"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="text"
              />

              <Box>
                <Tooltip title="Save" arrow>
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
                </Tooltip>
              </Box>
            </form>
          </Box>
        </Modal>
      </>
    </>
  );
};

export default AssetControlListCard;
