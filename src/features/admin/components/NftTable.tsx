import { Fragment, useEffect, useState } from 'react';

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
  Link,
  TableBody,
  Modal,
  TextField,
  FormControl,
  Select,
  MenuItem,
  TextareaAutosize,
  IconButton,
  Avatar,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import LaunchTwoToneIcon from '@mui/icons-material/LaunchTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import ExcelJS from 'exceljs';
import { collection, doc, getDocs, query, updateDoc } from 'firebase/firestore';
import useFirebase from 'lib/useFirebase';
import algoliasearch from 'algoliasearch';
import { Hits } from 'components/common/Algolia/Hits';
import { SearchBox } from 'components/common/Algolia/SearchBox';
import { InstantSearch, Pagination } from 'react-instantsearch-hooks-web';
import { useFormik } from 'formik';
import { format } from 'date-fns';
import { useRouter } from 'next/router';

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

const LabelSuccess = styled(Box)(
  ({ theme }) =>
    `
    display: inline-block;
    background: ${theme.colors.success.lighter};
    color: ${theme.colors.success.main};
    font-size: ${theme.typography.pxToRem(11)};
    font-weight: bold;
    padding: ${theme.spacing(1, 2)};
    border-radius: ${theme.general.borderRadiusSm};
  `,
);

const TableRowDivider = styled(TableRow)(
  ({ theme }) =>
    `
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
};

const searchClient = algoliasearch(
  `${process.env.NEXT_PUBLIC_ALGOLIA_APP_ID}`,
  `${process.env.NEXT_PUBLIC_ALGOLIA_API_KEY}`,
);

const Hit = ({ hit }: any) => {
  const { db } = useFirebase();

  const set_date = hit.created_at
    ? format(new Date(hit.created_at), 'yyyy/MM/dd')
    : '';

  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const formik = useFormik({
    initialValues: {
      nickname: hit.nickname,
      invitation_code: hit.invitation_code,
      invitation_confirmed: hit.invitation_confirmed,
      invited_code: hit.invited_code,
      memo: hit.memo,
    },
    onSubmit: async (values, helpers) => {
      try {
        if (db) {
          const docRef = doc(db, 'users', hit.wallet_address);
          await updateDoc(docRef, values);
          setOpen(false);
          // setUpdated((prev: any) => !prev);
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

  const router = useRouter();

  const handleMoveToDetail = (e: any) => {
    router.push(`/admin/nft/${hit.id}`);
  };

  return (
    <>
      {/* NFTテーブル */}
      <Fragment>
        <TableBody>
          <TableRow hover>
            <TableCell>
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
                  src={hit.image}
                ></Avatar>
              </Box>
            </TableCell>
            <TableCell>
              <Box pl={1}>
                <Box
                  onClick={handleMoveToDetail}
                  color="text.primary"
                  fontWeight="bold"
                  sx={{
                    '&:hover': {
                      color: `${theme.colors.primary.main}`,
                    },
                  }}
                >
                  {hit.name}
                </Box>
                <Typography variant="subtitle2" noWrap>
                  {hit.owner_wallet_address}
                </Typography>
                <Typography variant="subtitle2" noWrap>
                  {set_date}
                </Typography>
              </Box>
            </TableCell>
            <TableCell align="center">
              <Box>
                <LabelSuccess>{hit.series}</LabelSuccess>
              </Box>
            </TableCell>
            <TableCell align="center">
              <Box>
                <LabelSuccess>{hit.level}</LabelSuccess>
              </Box>
            </TableCell>
            <TableCell align="center">
              <Box>
                <LabelSuccess>{hit.nft_points}</LabelSuccess>
              </Box>
            </TableCell>
            <TableCell align="center">
              <Box>
                <LabelSuccess>{hit.activeStatus}</LabelSuccess>
              </Box>
            </TableCell>
            <TableCell align="center">
              <Box>
                <LabelSuccess>{hit.last_sale_eth_price}</LabelSuccess>
              </Box>
            </TableCell>
            <TableCell align="center">
              <Box>
                <LabelSuccess>{hit.last_sale_usd_price}</LabelSuccess>
              </Box>
            </TableCell>
            <TableCell>
              <Box display="flex" alignItems="center">
                <Box>
                  <Link
                    href="#"
                    color="text.primary"
                    underline="none"
                    noWrap
                    variant="h5"
                    sx={{
                      '&:hover': {
                        color: `${theme.colors.primary.main}`,
                      },
                    }}
                  >
                    {hit.memo}
                  </Link>
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
                  onClick={handleOpen}
                >
                  <LaunchTwoToneIcon fontSize="small" />
                </IconButton>
              </Box>
            </TableCell>
          </TableRow>
          <TableRowDivider />
        </TableBody>
      </Fragment>

      {/* 編集フォーム */}
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
                    src={hit.avatar}
                  ></Avatar>
                </Box>
                <Box pl={1}>
                  <Typography color="text.primary">{hit.nickname}</Typography>
                  <Typography variant="subtitle2" noWrap>
                    {hit.wallet_address}
                  </Typography>
                </Box>
              </Box>
              <TextField
                sx={{
                  mb: 0,
                }}
                id="outlined-required"
                fullWidth
                label="Nickname"
                defaultValue={hit.nickname}
                margin="normal"
                name="nickname"
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
                label="Invitation code"
                defaultValue={hit.invitation_code}
                margin="normal"
                name="invitation_code"
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
                <TextField
                  sx={{
                    mb: 1,
                  }}
                  id="outlined-required"
                  fullWidth
                  label="Invited code"
                  defaultValue={hit.invited_code}
                  margin="normal"
                  name="invited_code"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="text"
                />
              </FormControl>
              <FormControl
                fullWidth
                sx={{
                  mb: 1,
                }}
              >
                <Select
                  name="invitation_confirmed"
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Invitation confirmed"
                  defaultValue={hit.invitation_confirmed}
                  onChange={formik.handleChange}
                >
                  <MenuItem value={true as any}>True</MenuItem>
                  <MenuItem value={false as any}>False</MenuItem>
                </Select>
              </FormControl>

              <TextareaAutosize
                minRows={3}
                defaultValue={hit.memo}
                name="memo"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                className="editTextarea"
              />

              <Box>
                <IconButton
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
                  type="submit"
                >
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Box>
            </form>
          </Box>
        </Modal>
      </>
    </>
  );
};

const UserTable = () => {
  const theme = useTheme();

  const classes = useStyles();
  const [nfts, setNfts] = useState<any[]>([]);
  const [updated, setUpdated] = useState<boolean>(false);
  const { db } = useFirebase();

  useEffect(() => {
    const searchNfts = async () => {
      if (db) {
        const q = query(collection(db, 'nfts'));
        const querySnapshot = await getDocs(q);
        const nftList: any[] | ((prevState: never[]) => never[]) = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          nftList.push({
            ...data,
            fixed_created_at: data.created_at.toDate().toLocaleString(),
            number: Number(data.name?.substr(data.name.indexOf('#') + 1)) || 0,
          });
        });
        setNfts(nftList);
      }
    };
    searchNfts();
  }, [db, updated, setUpdated]);

  // xlsx export
  const handlerClickDownloadButton = async (
    e: React.MouseEvent<HTMLButtonElement>,
    format: string,
  ) => {
    e.preventDefault();

    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet('nftlist');
    const worksheet = workbook.getWorksheet('nftlist');

    if (worksheet) {
      worksheet.columns = [
        { header: 'Series', key: 'series' },
        { header: 'Level', key: 'level' },
        { header: 'NFT Points', key: 'nft_points' },
        { header: 'Name', key: 'name' },
        { header: 'Number', key: 'number' },
        { header: 'ID', key: 'id' },
        { header: 'Set Date', key: 'fixed_created_at' },
        { header: 'Status', key: 'activeStatus' },
        { header: 'Owner Wallet Address', key: 'owner_wallet_address' },
        { header: 'Last sale ETH price', key: 'last_sale_eth_price' },
        { header: 'Last sale USD price', key: 'last_sale_usd_price' },
        { header: 'Num Sales', key: 'num_sales' },
        { header: 'Memo', key: 'memo' },
        { header: 'BTC', key: 'set_btc' },
        { header: 'ETH', key: 'set_eth' },
        { header: 'XRP', key: 'set_xrp' },
        { header: 'ATOM', key: 'set_atom' },
        { header: 'MATIC', key: 'set_matic' },
        { header: 'SOL', key: 'set_sol' },
        { header: 'APE', key: 'set_ape' },
        { header: 'ADA', key: 'set_ada' },
        { header: 'SAND', key: 'set_sand' },
        { header: 'LTC', key: 'set_ltc' },
        { header: 'LINK', key: 'set_link' },
        { header: 'DOT', key: 'set_dot' },
        { header: 'BNB', key: 'set_bnb' },
      ];

      worksheet.addRows(nfts);
    }

    const uint8Array =
      format === 'xlsx'
        ? await workbook.xlsx.writeBuffer() //xlsxの場合
        : await workbook.csv.writeBuffer(); //csvの場合
    const blob = new Blob([uint8Array], { type: 'application/octet-binary' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cryptotrust_nftdata.' + format; //フォーマットによってファイル拡張子を変えている
    a.click();
    a.remove();
  };

  return (
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
            Admin Page
          </Typography>
          <Typography variant="h4">User List</Typography>
        </Box>
        <Box>
          <Button
            sx={{ mr: 2 }}
            variant="outlined"
            onClick={(e) => handlerClickDownloadButton(e, 'xlsx')}
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            onClick={(e) => handlerClickDownloadButton(e, 'csv')}
          >
            CSV
          </Button>
        </Box>
      </Box>
      <InstantSearch indexName="admin_nftlist" searchClient={searchClient}>
        <List disablePadding>
          <Box px={3} pb={3}>
            <Box mt={2}>
              <SearchBox />
            </Box>
            <TableContainer>
              <TableWrapper>
                <TableHeadWrapper>
                  <TableRow>
                    <TableCell>
                      <Typography className={classes.bold} noWrap>
                        Image
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      <Typography className={classes.bold} noWrap>
                        Name / Owner Wallet Address / Set Date
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      <Typography className={classes.bold} noWrap>
                        Series
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      <Typography className={classes.bold} noWrap>
                        Level
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      <Typography className={classes.bold} noWrap>
                        NFT Points
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      <Typography className={classes.bold} noWrap>
                        Status
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      <Typography className={classes.bold} noWrap>
                        Last Sale ETH price
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      <Typography className={classes.bold} noWrap>
                        Last Sale USD price
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      <Typography className={classes.bold} noWrap>
                        Memo
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography className={classes.bold} noWrap>
                        Action
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHeadWrapper>
                <Hits hitComponent={Hit} />
              </TableWrapper>
            </TableContainer>
            <Box mt={2}>
              <Pagination />
            </Box>
          </Box>
        </List>
      </InstantSearch>
    </Card>
  );
};

export default UserTable;
