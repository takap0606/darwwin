import { Grid, Box, Typography, MobileStepper, Button } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { useContext, useEffect, useState } from 'react';
import useFirebase from 'lib/useFirebase';
import { UserContext } from 'contexts/UserContext';
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  startAfter,
  DocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import AssetList from 'features/dashboard/components/AssetList';
import InvestContext from 'contexts/InvestContext';
import scrollToTop from 'utils/scrollToTop';
import { useRouter } from 'next/router';

const AdminInvest = ({ tokens, isTokenReady }: any) => {
  const { shouldReload } = useContext(InvestContext);
  const { db } = useFirebase();
  const { userInfo } = useContext(UserContext);
  const [selectedListData, setSelectedListData] = useState<any>([]);
  const WALLET_ADDRESS = userInfo.walletAddress || '';
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot<DocumentData> | null>(
    null,
  );

  // urlからidを取得
  const router = useRouter();

  useEffect(() => {
    const getTotalDocs = async () => {
      if (WALLET_ADDRESS !== '' && db) {
        const nftsRef = query(
          collection(db, 'nfts'),
          where('id', '==', router.query.id),
        );

        const allDocs = await getDocs(nftsRef);
        setTotalDocs(allDocs.size);
      }
    };
    getTotalDocs();
  }, [WALLET_ADDRESS, db]);

  const searchNft = async (startAfterDoc?: DocumentSnapshot<DocumentData>) => {
    if (WALLET_ADDRESS !== '' && db) {
      let nftsRef = query(
        collection(db, 'nfts'),
        where('id', '==', router.query.id),
        orderBy('created_at'),
        limit(10),
      );

      if (startAfterDoc) {
        nftsRef = query(nftsRef, startAfter(startAfterDoc));
      }

      const data = await getDocs(nftsRef);
      const nftsDataList = data.docs.map((doc) => {
        const docData = doc.data();
        return {
          ...docData,
          created_at:
            docData?.created_at?.toDate().toLocaleDateString('en-US') || '',
        };
      });

      if (data.docs.length > 0) {
        setLastDoc(data.docs[data.docs.length - 1]);
      }

      setSelectedListData(nftsDataList);
    }
  };

  useEffect(() => {
    if (page === 1) {
      searchNft();
    } else if (lastDoc !== null) {
      searchNft(lastDoc);
    }
  }, [WALLET_ADDRESS, db, shouldReload, page]);

  const handleNext = () => {
    setPage((prev) => prev + 1);
    scrollToTop();
  };

  const handleBack = () => {
    setPage((prev) => prev - 1);
    scrollToTop();
  };

  return (
    <>
      {selectedListData.length > 0 && isTokenReady && (
        <Box mb={3}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              pb: 3,
            }}
          >
            <Typography variant="h3">My Assets</Typography>
          </Box>
          <Grid>
            <AssetList
              listData={selectedListData}
              tokens={tokens}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </Grid>
        </Box>
      )}
      {!isLoading && (
        <MobileStepper
          variant="progress"
          steps={Math.ceil(totalDocs / 10)}
          position="static"
          activeStep={page - 1}
          nextButton={
            <Button
              size="small"
              onClick={handleNext}
              disabled={
                isLoading ||
                page >= Math.ceil(totalDocs / 10) ||
                isTokenReady === false
              }
            >
              Next
              {<KeyboardArrowRight />}
            </Button>
          }
          backButton={
            <Button
              size="small"
              onClick={handleBack}
              disabled={isLoading || page === 1 || isTokenReady === false}
            >
              {<KeyboardArrowLeft />}
              Back
            </Button>
          }
        />
      )}
    </>
  );
};

export default AdminInvest;
