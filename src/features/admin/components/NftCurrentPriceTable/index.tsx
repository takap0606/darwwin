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
  Tab,
  Tabs,
  Button,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useState } from 'react';
import useFirebase from 'lib/useFirebase';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import DuplicationNftCard from '../DuplicationNftCard';
import Loader from 'components/common/Loader';
import { fetchTokenPrice } from 'utils/fetchTokenPrice';
import { createTokenTypes, getTokenList } from 'utils/getCurrentTokenPrice';
import { addCurrentPriceToNfts } from 'features/admin/utils/addCurrentPriceToNfts';
import ExcelJS from 'exceljs';

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

const SERIES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

const NftCurrentPriceTable = () => {
  const { db } = useFirebase();
  const theme = useTheme();
  const classes = useStyles();

  const [filteredNfts, setFilteredNfts] = useState<any[]>([]);
  const [updated, setUpdated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);

  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    setIsSearched(false);
  };

  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  };

  const searchNfts = async () => {
    setIsSearched(true);
    setIsLoading(true);
    if (db) {
      //トークン価格の取得
      const tokenPrice = await fetchTokenPrice();
      const tokenTypes = createTokenTypes(tokenPrice, getTokenList());

      const series = SERIES[value];
      const q = query(collection(db, 'nfts'), where('series', '==', series));
      const querySnapshot = await getDocs(q);
      const nftList: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        nftList.push({
          uid: doc.id,
          number: Number(data.name.substr(data.name.indexOf('#') + 1)),
          ...data,
        });
      });

      // Recordsの取得
      const recordsQuery = query(
        collection(db, 'record'),
        where('series', '==', series),
        orderBy('created_at'),
      );
      const recordsQuerySnapshot = await getDocs(recordsQuery);
      const recordsList: any[] = [];
      recordsQuerySnapshot.forEach((doc) => {
        recordsList.push(doc.data());
      });

      let newNfts: any[] = [];

      nftList.forEach((nft) => {
        const targetRecords = recordsList.filter((record) =>
          record.target.includes(nft.id),
        );
        nft.records = targetRecords;

        const { current_asset_price, tokenAmounts, newTotalGrowth }: any =
          addCurrentPriceToNfts(nft, tokenTypes);

        // tokenAmountsPropsオブジェクトのインデックスシグネチャを定義
        const tokenAmountsProps: Record<string, any> = {};

        // tokenAmountsの各トークンに対応する値を取り出し、新しいプロパティとして追加
        for (const [token, amount] of Object.entries(tokenAmounts || {})) {
          tokenAmountsProps[token + '_amount'] = amount; // 例: 'btc_amount'
        }

        newNfts.push({
          ...nft,
          ...tokenAmountsProps,
          fixed_created_at: nft.created_at.toDate().toLocaleString(),
          number: Number(nft.name.substr(nft.name.indexOf('#') + 1)),
          current_asset_price,
          tokenAmounts,
          newTotalGrowth,
        });
      });

      setFilteredNfts(newNfts);
    }
    setIsLoading(false);
  };

  // xlsx export
  const handlerClickDownloadButton = async (
    e: React.MouseEvent<HTMLButtonElement>,
    format: string,
  ) => {
    e.preventDefault();

    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet('nftlistWithCurrentPrice');
    const worksheet = workbook.getWorksheet('nftlistWithCurrentPrice');

    if (worksheet) {
      worksheet.columns = [
        { header: 'Series', key: 'series' },
        { header: 'Level', key: 'level' },
        { header: 'Name', key: 'name' },
        { header: 'Number', key: 'number' },
        { header: 'ID', key: 'id' },
        { header: 'Set Date', key: 'fixed_created_at' },
        { header: 'Status', key: 'active_status' },
        { header: 'Owner Wallet Address', key: 'owner_wallet_address' },
        { header: 'Last sale ETH price', key: 'last_sale_eth_price' },
        { header: 'Last sale USD price', key: 'last_sale_usd_price' },
        { header: 'Current Asset Price', key: 'current_asset_price' },
        { header: 'Num Sales', key: 'num_sales' },
        { header: 'Memo', key: 'memo' },
        { header: 'BTC', key: 'set_btc' },
        { header: 'BTC Current', key: 'btc_amount' },
        { header: 'ETH', key: 'set_eth' },
        { header: 'ETH Current', key: 'eth_amount' },
        { header: 'PDT', key: 'set_pdt' },
        { header: 'PDT Current', key: 'pdt_amount' },
        { header: 'XRP', key: 'set_xrp' },
        { header: 'XRP Current', key: 'xrp_amount' },
        { header: 'ATOM', key: 'set_atom' },
        { header: 'ATOM Current', key: 'atom_amount' },
        { header: 'MATIC', key: 'set_matic' },
        { header: 'MATIC Current', key: 'matic_amount' },
        { header: 'SOL', key: 'set_sol' },
        { header: 'SOL Current', key: 'sol_amount' },
        { header: 'APE', key: 'set_ape' },
        { header: 'APE Current', key: 'ape_amount' },
        { header: 'ADA', key: 'set_ada' },
        { header: 'ADA Current', key: 'ada_amount' },
        { header: 'SAND', key: 'set_sand' },
        { header: 'SAND Current', key: 'sand_amount' },
        { header: 'LTC', key: 'set_ltc' },
        { header: 'LTC Current', key: 'ltc_amount' },
        { header: 'LINK', key: 'set_link' },
        { header: 'LINK Current', key: 'link_amount' },
        { header: 'DOT', key: 'set_dot' },
        { header: 'DOT Current', key: 'dot_amount' },
        { header: 'BNB', key: 'set_bnb' },
        { header: 'BNB Current', key: 'bnb_amount' },
        { header: 'FIL', key: 'set_fil' },
        { header: 'FIL Current', key: 'fil_amount' },
        { header: 'AVAX', key: 'set_avax' },
        { header: 'AVAX Current', key: 'avax_amount' },
        { header: 'TRX', key: 'set_trx' },
        { header: 'TRX Current', key: 'trx_amount' },
        { header: 'DOGE', key: 'set_doge' },
        { header: 'DOGE Current', key: 'doge_amount' },
        { header: 'XMR', key: 'set_xmr' },
        { header: 'XMR Current', key: 'xmr_amount' },
      ];

      worksheet.addRows(filteredNfts);
    }

    const uint8Array =
      format === 'xlsx'
        ? await workbook.xlsx.writeBuffer() //xlsxの場合
        : await workbook.csv.writeBuffer(); //csvの場合
    const blob = new Blob([uint8Array], { type: 'application/octet-binary' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'darwwin_nftdata.' + format; //フォーマットによってファイル拡張子を変えている
    a.click();
    a.remove();
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={value} onChange={handleChange} aria-label="Series Tabs">
          <Tab label="A" {...a11yProps(0)} />
          <Tab label="B" {...a11yProps(1)} />
          <Tab label="C" {...a11yProps(2)} />
          <Tab label="D" {...a11yProps(3)} />
          <Tab label="E" {...a11yProps(4)} />
          <Tab label="F" {...a11yProps(5)} />
          <Tab label="G" {...a11yProps(6)} />
          <Tab label="H" {...a11yProps(7)} />
          <Tab label="I" {...a11yProps(8)} />
          <Tab label="J" {...a11yProps(9)} />
        </Tabs>
      </Box>
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
              NFT Asset List
            </Typography>
            <Typography variant="h4">NFTs Current Price List</Typography>
          </Box>
          <Box>
            <Button
              sx={{ mr: 2 }}
              variant="outlined"
              onClick={() => searchNfts()}
              disabled={isSearched}
            >
              Search NFTs
            </Button>
            {isSearched && (
              <Button
                sx={{ mr: 2 }}
                variant="outlined"
                onClick={(e) => handlerClickDownloadButton(e, 'xlsx')}
              >
                Excel
              </Button>
            )}
          </Box>
        </Box>
        {isLoading ? (
          <Loader />
        ) : (
          <List disablePadding>
            <Box px={3} pb={3}>
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
                    </TableRow>
                  </TableHeadWrapper>
                  {filteredNfts.length > 0 &&
                    filteredNfts.map((nft, index) => (
                      <DuplicationNftCard
                        nft={nft}
                        key={index}
                        setUpdated={setUpdated}
                        updated={updated}
                      />
                    ))}
                </TableWrapper>
              </TableContainer>
            </Box>
          </List>
        )}
      </Card>
    </>
  );
};

export default NftCurrentPriceTable;
