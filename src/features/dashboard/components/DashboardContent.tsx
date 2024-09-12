import DashboardPageHeader from 'components/ui/DashboardPageHeader';
import PageHeaderWrapper from 'components/ui/PageHeaderWrapper';
import Footer from 'components/common/Layout/Footer';

import { Grid } from '@mui/material';
import OpenseaWallet from 'features/dashboard/components/OpenseaWallet';
import Invest from 'features/dashboard/components/Invest';
import InvestContext from 'contexts/InvestContext';
import { useEffect, useState } from 'react';
import { createTokenTypes, getTokenList } from 'utils/getCurrentTokenPrice';

const DashboardContent = ({ tokenPrice }: any) => {
  const [shouldReload, setShouldReload] = useState<boolean>(false);
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
    <InvestContext.Provider value={{ shouldReload, setShouldReload }}>
      <PageHeaderWrapper>
        <DashboardPageHeader />
      </PageHeaderWrapper>
      <Grid
        sx={{ px: 4 }}
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={3}
      >
        <Grid item lg={12} xs={12}>
          <OpenseaWallet tokens={tokens} />
        </Grid>
        <Grid item lg={12} xs={12}>
          <Invest tokens={tokens} isTokenReady={isTokenReady} />
        </Grid>
      </Grid>
      <Footer />
    </InvestContext.Provider>
  );
};

export default DashboardContent;
