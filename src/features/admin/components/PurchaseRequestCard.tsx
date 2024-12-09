import { Fragment, useEffect, useState } from 'react';

import {
  Box,
  Typography,
  Avatar,
  styled,
  useTheme,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Tooltip,
  IconButton,
  Slide,
} from '@mui/material';
import { useRouter } from 'next/router';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import useFirebase from 'lib/useFirebase';
import axios from 'axios';
import { TRANSFER_ADDRESS } from 'constants/TRANSFER_ADDRESS';
import { useSnackbar } from 'notistack';
import DeleteIcon from '@mui/icons-material/Delete';

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

const LabelAlert = styled(Box)(
  ({ theme }) => `
        display: inline-block;
        background: ${theme.colors.warning.light};
        color: ${theme.colors.warning.main};
        text-transform: uppercase;
        font-size: ${theme.typography.pxToRem(11)};
        font-weight: bold;
        padding: ${theme.spacing(1, 2)};
        border-radius: ${theme.general.borderRadiusSm};
        white-space: nowrap;
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

type NftStatus = {
  activeStatus: string;
  owner_wallet_address: string;
};

const PurchaseRequestCard = ({ request, updated, setUpdated }: any) => {
  const { db } = useFirebase();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [nftStatus, setNftStatus] = useState<NftStatus>();

  //handleTransferedボタンを複数回押せないように制御する
  const [isPushed, setIsPushed] = useState(false);

  const router = useRouter();
  const moveToDetail = () => {
    router.push({
      pathname: `/admin/cal/capitalgain/${request.uid}`,
    });
  };

  const handleTransfered = async () => {
    if (db) {
      setIsPushed(true);
      const nftRef = doc(db, 'purchase-request', request.uid);
      await updateDoc(nftRef, {
        transfered: true,
      });
    }
  };

  const searchNft = async () => {
    if (db) {
      const querySnapshot = await getDocs(
        query(collection(db, 'nfts'), where('id', '==', request.nft_id)),
      );

      const data = querySnapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          activeStatus: docData.active_status,
          owner_wallet_address: docData.owner_wallet_address,
        };
      });

      setNftStatus(data[0]);
    }
  };

  useEffect(() => {
    searchNft();
  }, [db]);

  // Reservoirで運営アカウントにトランスファー済みか確認する
  const [reservoirData, setReservoirData] = useState<any>([]);
  const [isChecked, setIsChecked] = useState(false);

  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'X-API-KEY': process.env.NEXT_PUBLIC_RESERVOIR_API || '',
    },
  };

  const checkTransferState = () => {
    try {
      const fetchData = async () => {
        const collectionSlugs = '0xf532e895f1fb80ce4bc1bb88c2887d35e764c5d4';

        const encodedString = encodeURIComponent(request.nft_name);

        const response: any = await axios.get(
          `https://api.reservoir.tools/tokens/v7?collection=${collectionSlugs}&tokenName=${encodedString}`,
          options,
        );

        // tokenIdが一致するトークンを検索
        const targetToken = response.data.tokens.find(
          (item: any) => item.token.tokenId === request.nft_id,
        );

        setReservoirData(targetToken ? targetToken : null);
        setIsChecked(true);
      };
      fetchData();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const soldDate = request?.sold_date
    ? request?.sold_date.toDate().toLocaleDateString('en-US')
    : '';

  return (
    <>
      <Fragment key={request?.id}>
        <TableBody>
          <TableRow hover>
            <TableCell>
              <Box display="flex" alignItems="center">
                <Avatar
                  sx={{
                    fontSize: `${theme.typography.pxToRem(15)}`,
                    background: `${theme.colors.alpha.black[10]}`,
                    color: `${theme.colors.alpha.black[70]}`,
                    width: 80,
                    height: 80,
                  }}
                  alt=""
                  src={request?.nft_image}
                ></Avatar>
              </Box>
            </TableCell>
            <TableCell>
              <Box pl={1}>
                <Box
                  onClick={moveToDetail}
                  color="text.primary"
                  fontWeight="bold"
                  sx={{
                    '&:hover': {
                      color: `${theme.colors.primary.main}`,
                    },
                  }}
                >
                  {request?.nft_name}
                </Box>
                <Typography variant="subtitle2" noWrap>
                  {request?.sold_owner_wallet_address}
                </Typography>
                <Typography variant="subtitle2" noWrap>
                  {soldDate}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Typography>{nftStatus?.owner_wallet_address}</Typography>
              <LabelSuccess mt={1}>{nftStatus?.activeStatus}</LabelSuccess>
            </TableCell>

            <TableCell align="center">
              <Box>
                {isChecked && (
                  <>
                    {reservoirData?.token.owner ==
                    TRANSFER_ADDRESS.toLocaleLowerCase() ? (
                      <LabelSuccess>運営アカウントに送信済み</LabelSuccess>
                    ) : (
                      <LabelAlert>送信されていません</LabelAlert>
                    )}
                  </>
                )}
                {!isChecked && (
                  <Button
                    disabled={isChecked}
                    onClick={() => checkTransferState()}
                  >
                    Check
                  </Button>
                )}
              </Box>
            </TableCell>
            <TableCell align="center">
              <Box>
                <LabelSuccess>
                  {request.transfered ? 'Done' : 'Not yet'}
                </LabelSuccess>
                {request.transfered !== true && (
                  <Button
                    disabled={isPushed}
                    onClick={() => handleTransfered()}
                  >
                    Transfered
                  </Button>
                )}
              </Box>
            </TableCell>
            <TableCell align="center">
              <Box>
                <LabelSuccess>
                  {request.affiliate_saved ? 'Saved' : 'Not saved'}
                </LabelSuccess>
              </Box>
            </TableCell>

            <TableCell align="center">
              <Box>
                <LabelSuccess>{request?.series}</LabelSuccess>
              </Box>
            </TableCell>
            <TableCell
              onClick={async () => {
                if (!db) return;
                enqueueSnackbar('Successfully Deleted!', {
                  variant: 'success',
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right',
                  },
                  autoHideDuration: 2000,
                  TransitionComponent: Slide,
                });
                setUpdated(!updated);

                // doc関数を使用して、削除するドキュメントの参照を取得
                const docRef = doc(db, 'purchase-request', request.uid);

                // deleteDoc関数を使用してドキュメントを削除
                await deleteDoc(docRef);
              }}
            >
              <Tooltip title={'Delete'} arrow>
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
                  <DeleteIcon fontSize="small" />
                </IconButtonWrapper>
              </Tooltip>
            </TableCell>
          </TableRow>
          <TableRowDivider />
        </TableBody>
      </Fragment>
    </>
  );
};

export default PurchaseRequestCard;
