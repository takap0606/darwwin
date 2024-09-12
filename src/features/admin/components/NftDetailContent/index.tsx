import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { createTokenTypes, getTokenList } from 'utils/getCurrentTokenPrice';
import AdminInvest from './AdminInvest';

const NftDetailContent = ({ tokenPrice }: any) => {
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
      <Grid
        sx={{ px: 4 }}
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={3}
      >
        <Grid item lg={12} xs={12}>
          <AdminInvest tokens={tokens} isTokenReady={isTokenReady} />
        </Grid>
      </Grid>
    </>
  );
};

export default NftDetailContent;
