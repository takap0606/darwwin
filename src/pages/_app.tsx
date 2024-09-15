import Head from 'next/head';
import type { AppProps } from 'next/app';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '../createEmotionCache';
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react';
import useFirebaseUser from 'lib/useFirebaseUser';
import Loader from 'components/common/Loader';
import ThemeProvider from 'theme/ThemeProvider';
import { SnackbarProvider } from 'notistack';
import { SidebarProvider } from 'contexts/SidebarContext';
import { UserProvider } from 'contexts/UserContext';
import 'styles/globals.css';

const clientSideEmotionCache = createEmotionCache();
interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const App = (props: MyAppProps) => {
  const {
    Component,
    emotionCache = clientSideEmotionCache,
    pageProps: { session, ...pageProps },
  } = props;

  const { user, isLoading: loadingAuth } = useFirebaseUser();

  return (
    <ThirdwebProvider
      clientId="785d3b6f9dd65654f576487a7c01c9a2"
      activeChain={ChainId.Mainnet}
      authConfig={{
        authUrl: '/api/auth/login',
        domain: process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN as string,
      }}
    >
      <CacheProvider value={emotionCache}>
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <SidebarProvider>
          <UserProvider>
            <ThemeProvider>
              <SnackbarProvider
                maxSnack={6}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
              >
                <CssBaseline />
                {loadingAuth ? <Loader /> : <Component {...pageProps} />}
              </SnackbarProvider>
            </ThemeProvider>
          </UserProvider>
        </SidebarProvider>
      </CacheProvider>
    </ThirdwebProvider>
  );
};

export default App;
