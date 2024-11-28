import { Grid, Box, Typography, Button, MobileStepper } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import useFirebase from 'lib/useFirebase';
import { UserContext } from 'contexts/UserContext';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  startAfter,
  DocumentSnapshot,
  DocumentData,
  limit,
} from 'firebase/firestore';
import InvestContext from 'contexts/InvestContext';
import AssetSellingList from 'features/request-selling/components/AssetSellingList';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { createTokenTypes, getTokenList } from 'utils/getCurrentTokenPrice';
import scrollToTop from 'utils/scrollToTop';

interface CryptoPrices {
  [key: string]: number;
}

const InvestSelling = ({ tokenPrice }: any) => {
  const { shouldReload } = useContext(InvestContext);
  const { db } = useFirebase();
  const { userInfo } = useContext(UserContext);
  const [selectedListData, setSelectedListData] = useState<any>([]);
  const [sellingFeeRate, setSellingFeeRate] = useState(0.3);
  const WALLET_ADDRESS = userInfo.walletAddress || '';
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot<DocumentData> | null>(
    null,
  );

  const fetchData = async (startAfterDoc?: DocumentSnapshot<DocumentData>) => {
    if (WALLET_ADDRESS !== '' && db) {
      let nftsRef = query(
        collection(db, 'nfts'),
        where('owner_wallet_address', '==', WALLET_ADDRESS),
        orderBy('created_at'),
        limit(10),
      );

      if (startAfterDoc) {
        nftsRef = query(
          collection(db, 'nfts'),
          where('owner_wallet_address', '==', WALLET_ADDRESS),
          orderBy('created_at'),
          startAfter(startAfterDoc),
          limit(10),
        );
      }

      const data = await getDocs(nftsRef);
      const nftsDataList = data.docs.map((doc) => {
        const docData = doc.data();
        return {
          ...docData,
          created_at: docData.created_at.toDate().toLocaleDateString('en-US'),
        };
      });
      setSelectedListData(nftsDataList);
      setLastDoc(data.docs[data.docs.length - 1]);

      // If it's the first page, get the total number of documents
      if (!startAfterDoc) {
        const totalRef = query(
          collection(db, 'nfts'),
          where('owner_wallet_address', '==', WALLET_ADDRESS),
        );
        const total = (await getDocs(totalRef)).size;
        setTotalDocs(total);
      }

      const nftsArray: any[] = [];
      let user_price_amount = 0;
      data.docs.forEach((doc) => {
        if (doc.exists()) {
          const data = doc.data();
          nftsArray.push({
            id: data.id,
            name: data.name,
            level: data.level,
            last_sale_usd_price: data.last_sale_usd_price,
          });
          user_price_amount += Number(data.last_sale_usd_price);
        }
      });

      // DARWINの場合
      // 売却手数料5%
      // 利益からの手数料8%〜15%

      let sellingFeeRate = 0.15; // common: デフォルト15%

      if (
        user_price_amount >= 100000 ||
        nftsArray.some((item) => item.level === 'ultra_rare')
      ) {
        sellingFeeRate = 0.08; // ultra_rare: 8%
      } else if (
        (user_price_amount >= 50000 && user_price_amount < 100000) ||
        nftsArray.some((item) => item.level === 'super_rare')
      ) {
        sellingFeeRate = 0.09; // super_rare: 9%
      } else if (
        (user_price_amount >= 10000 && user_price_amount < 50000) ||
        nftsArray.some((item) => item.level === 'rare')
      ) {
        sellingFeeRate = 0.1; // rare: 10%
      } else if (
        (user_price_amount >= 3000 && user_price_amount < 10000) ||
        nftsArray.some((item) => item.level === 'uncommon')
      ) {
        sellingFeeRate = 0.125; // uncommon: 12.5%
      }

      setSellingFeeRate(sellingFeeRate);
    }
  };

  useEffect(() => {
    if (page === 1) {
      fetchData();
    } else if (lastDoc !== null) {
      fetchData(lastDoc);
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

  const [tokens, setTokens] = useState<any>([]);
  const [isTokenReady, setIsTokenReady] = useState(false);

  useEffect(() => {
    const fetchTokens = async () => {
      //Paradise Exchangeから取得したデータでトークンの現在価格を検索
      const tokenTypes = createTokenTypes(tokenPrice, getTokenList());

      setTokens(tokenTypes);
      setIsTokenReady(true);
    };

    fetchTokens();
  }, []);

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
            <AssetSellingList
              listData={selectedListData}
              sellingFeeRate={sellingFeeRate}
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

export default InvestSelling;
