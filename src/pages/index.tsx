import type { NextPage } from 'next';
import {
  Box,
  Card,
  Container,
  Button,
  styled,
  CircularProgress,
} from '@mui/material';
import Head from 'next/head';
import { ConnectWallet, useAddress, useAuth } from '@thirdweb-dev/react';
import { signInWithCustomToken } from 'firebase/auth';
import React, { useState } from 'react';
import initializeFirebaseClient from '../lib/initFirebase';
import { getDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import styles from '../styles/Home.module.css';
import useFirebaseUser from '../lib/useFirebaseUser';
import { useRouter } from 'next/router';
import Logo from 'components/ui/LogoSign';
import Hero from 'features/login/Hero';
import Footer from 'components/common/Layout/Footer';

const HeaderWrapper = styled(Card)(
  ({ theme }) => `
  width: 100%;
  display: flex;
  align-items: center;
  height: ${theme.spacing(10)};
  margin-bottom: ${theme.spacing(10)};
  border-radius: 0;
`,
);

const OverviewWrapper = styled(Box)(
  ({ theme }) => `
    overflow: auto;
    background: ${theme.palette.common.white};
    flex: 1;
    overflow-x: hidden;
`,
);

const Home: NextPage = () => {
  const thirdwebAuth = useAuth();
  const address = useAddress();
  const { auth, db } = initializeFirebaseClient();
  const { user } = useFirebaseUser();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const shouldShowLoginButton = !user && address;

  const signIn = async () => {
    setIsLoading(true);
    const payload = await thirdwebAuth?.login();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload }),
      });

      const { token } = await res.json();

      const userCredential = await signInWithCustomToken(auth, token);
      const user = userCredential.user;

      const usersRef = doc(db, 'users', user.uid.toLocaleLowerCase()!);
      const userDoc = await getDoc(usersRef);

      if (!userDoc.exists()) {
        setDoc(usersRef, { created_at: serverTimestamp() }, { merge: true });
      }

      await router.replace('/dashboard');
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const goToDashboard = async () => {
    setIsLoading(true);
    try {
      await router.push('/dashboard');
    } catch (error) {
      console.error('Error navigating to dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <OverviewWrapper>
        <Head>
          <title>Dashboard</title>
        </Head>
        <HeaderWrapper>
          <Container maxWidth="lg">
            <Box display="flex" alignItems="center">
              <Logo />
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flex={1}
              >
                <Box />
                {shouldShowLoginButton ? (
                  <Box>
                    <Button
                      onClick={signIn}
                      variant="contained"
                      sx={{ ml: 2, color: '#fff' }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <CircularProgress color="inherit" size={24} />
                      ) : (
                        'Log in Affiliates'
                      )}
                    </Button>
                  </Box>
                ) : user ? (
                  <Box>
                    <Button
                      onClick={goToDashboard}
                      variant="contained"
                      sx={{ ml: 2, color: '#fff' }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <CircularProgress color="inherit" size={24} />
                      ) : (
                        'Go to Dashboard'
                      )}
                    </Button>
                  </Box>
                ) : (
                  <ConnectWallet className={styles.connectBtn} />
                )}
              </Box>
            </Box>
          </Container>
        </HeaderWrapper>
        <Hero />
        <Footer />
      </OverviewWrapper>
    </>
  );
};

export default Home;
