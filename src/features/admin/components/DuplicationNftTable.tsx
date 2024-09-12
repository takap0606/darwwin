import { useEffect, useState } from 'react';

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
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import useFirebase from 'lib/useFirebase';
import { collection, getDocs, query } from 'firebase/firestore';
import DuplicationNftCard from 'features/admin/components/DuplicationNftCard';

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

const DuplicationNftTable = () => {
  const { db } = useFirebase();
  const theme = useTheme();

  const classes = useStyles();
  const [filteredNfts, setFilteredNfts] = useState<any[]>([]);

  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    const searchNfts = async () => {
      if (db) {
        const q = query(collection(db, 'nfts'));
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
        const filteredNftList = nftList.filter(
          (x, i, array) => array.findIndex((y) => y.id === x.id) !== i,
        );
        setFilteredNfts(filteredNftList);
      }
    };
    searchNfts();
  }, [db, updated]);

  var total = filteredNfts.reduce(function (sum, element) {
    return sum + Number(element.last_sale_eth_price);
  }, 0);

  var companySample = 0;
  var totalWithoutTax = total * 0.97 * 0.8 - companySample;

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
          <Typography variant="h4">Duplication</Typography>
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
            <Typography variant="h4">{filteredNfts.length}</Typography>
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
        </Box>
      </Box>
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
                filteredNfts.map((nft) => (
                  <DuplicationNftCard
                    nft={nft}
                    key={nft.name + nft.uid}
                    setUpdated={setUpdated}
                    updated={updated}
                  />
                ))}
            </TableWrapper>
          </TableContainer>
        </Box>
      </List>
    </Card>
  );
};

export default DuplicationNftTable;
