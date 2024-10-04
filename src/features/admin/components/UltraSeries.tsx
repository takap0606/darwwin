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
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import useFirebase from 'lib/useFirebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import UltraSeriesCard from './UltraSeriesCard';

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

const UltraSeries = () => {
  const { db } = useFirebase();
  const theme = useTheme();

  const classes = useStyles();
  const [nfts, setNfts] = useState<any[]>([]);
  const [filteredNfts, setFilteredNfts] = useState<any[]>([]);
  // シリーズを引数にポートフォリオを作成する
  // const seriesAtoJ = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  // const selectedPortfolio = seriesAtoJ.includes(series)
  //   ? createPortfolio(series)
  //   : [];

  const [updated, setUpdated] = useState(false);

  // nameを降順にソートする場合
  nfts.sort(function (a, b) {
    if (a.number < b.number) {
      return -1;
    }
    if (a.number > b.number) {
      return 1;
    }
    return 0;
  });

  useEffect(() => {
    const searchNfts = async () => {
      if (db) {
        const q = query(collection(db, 'nfts'), where('series', '==', 'Ultra'));
        const querySnapshot = await getDocs(q);
        const nftList: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          nftList.push({
            uid: doc.id,
            number: Number(data.name?.substr(data.name?.indexOf('#') + 1) || 0),
            ...data,
          });
        });
        setNfts(nftList);
        // 運用設定が必要なNFTのみ表示する絞り込み機能
        const values = ['0', undefined];
        const filteredData = nftList.filter((data) =>
          values.includes(data.set_btc),
        );
        setFilteredNfts(filteredData);
      }
    };
    searchNfts();
  }, [db, updated]);

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(!open);
  };

  var total = nfts.reduce(function (sum, element) {
    return sum + Number(element.last_sale_eth_price);
  }, 0);

  //   var companySample = 0.6355 * 0.97 * 0.8;
  var companySample = 0;
  var totalWithoutTax = total * 0.97 * 0.8 - companySample;

  const [onFilter, setOnFilter] = useState(true);
  const nftsFilter = () => {
    setOnFilter(!onFilter);
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
            NFT Asset List
          </Typography>
          <Typography variant="h4">ULTRA RARE</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Box mr={4}>
            <Typography
              variant="caption"
              fontWeight="bold"
              sx={{
                fontSize: `${theme.typography.pxToRem(12)}`,
              }}
            >
              個数
            </Typography>
            <Typography variant="h4">
              {onFilter ? filteredNfts.length : nfts.length}
            </Typography>
          </Box>
          <Box mr={4}>
            <Typography
              variant="caption"
              fontWeight="bold"
              sx={{
                fontSize: `${theme.typography.pxToRem(12)}`,
              }}
            >
              Total Sum
            </Typography>
            <Typography variant="h4">
              {totalWithoutTax.toFixed(6)} ETH
            </Typography>
          </Box>
          <Box mr={4}>
            <Button onClick={() => nftsFilter()}>Filter</Button>
          </Box>
          <Box onClick={handleOpen}>{!open ? <AddIcon /> : <RemoveIcon />}</Box>
        </Box>
      </Box>
      {open && (
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
                    <TableCell align="left">
                      <Typography className={classes.bold} noWrap>
                        Set status
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography className={classes.bold} noWrap>
                        Transfer
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHeadWrapper>
                {onFilter == true ? (
                  <>
                    {filteredNfts.length > 0 &&
                      filteredNfts.map((nft) => (
                        <UltraSeriesCard
                          nft={nft}
                          setUpdated={setUpdated}
                          updated={updated}
                          key={nft.name + nft.uid}
                        />
                      ))}
                  </>
                ) : (
                  <>
                    {nfts.length > 0 &&
                      nfts.map((nft) => (
                        <UltraSeriesCard
                          nft={nft}
                          setUpdated={setUpdated}
                          updated={updated}
                          key={nft.id + nft.uid}
                        />
                      ))}
                  </>
                )}
              </TableWrapper>
            </TableContainer>
          </Box>
        </List>
      )}
    </Card>
  );
};

export default UltraSeries;
