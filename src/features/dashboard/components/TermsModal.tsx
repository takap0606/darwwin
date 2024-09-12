import { useState, ChangeEvent } from 'react';
import {
  Box,
  Card,
  Typography,
  Container,
  Button,
  styled,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';

import Logo from 'components/ui/LogoSign';
import Layout from 'components/common/Layout';
import initializeFirebaseClient from 'lib/initFirebase';
import { doc, updateDoc } from 'firebase/firestore';
import TermsOfUse from './TermsOfUse';

const MainContent = styled(Box)(
  () => `
      height: 100%;
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 50px 0;
  `,
);

function TermsModal({ userInfo, db }: { userInfo: any; db: any }) {
  const { auth } = initializeFirebaseClient();
  const router = useRouter();

  const [isRead, setIsRead] = useState(false);

  const handleAcceptTerms = async () => {
    try {
      const userRef = doc(db, 'users', userInfo.walletAddress);
      await updateDoc(userRef, {
        terms_accepted: true,
      });
      window.location.reload();
      // 他の状態更新や適切なナビゲーションをここで実行
    } catch (error) {
      console.error('Error updating terms acceptance: ', error);
    }
  };

  const handleClickIsRead = (event: ChangeEvent<HTMLInputElement>) => {
    setIsRead(event.target.checked);
  };

  return (
    <>
      <Head>
        <title>Terms of Use</title>
      </Head>
      <MainContent>
        <Container maxWidth="sm">
          <Logo />
          <Card
            sx={{
              mt: 3,
              p: 4,
            }}
          >
            <Box>
              <Typography
                variant="h2"
                sx={{
                  mb: 1,
                }}
              >
                Terms of Use
              </Typography>
            </Box>

            <Box>
              <TermsOfUse />
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isRead}
                    onChange={handleClickIsRead}
                    color="primary"
                  />
                }
                label="I have read the Terms of Use"
              />
              <Button
                sx={{
                  mt: 3,
                }}
                color="primary"
                disabled={!isRead}
                onClick={handleAcceptTerms}
                fullWidth
                size="large"
                variant="contained"
              >
                I have accepted the Terms of Use
              </Button>
              <Button
                sx={{
                  mt: 3,
                }}
                onClick={async () => void signOut(auth) && router.replace('/')}
                color="primary"
                fullWidth
                size="large"
                variant="contained"
              >
                I have not accepted the Terms of Use
              </Button>
            </Box>
          </Card>
        </Container>
      </MainContent>
    </>
  );
}

export default TermsModal;

TermsModal.getLayout = function getLayout(page: any) {
  return <Layout>{page}</Layout>;
};
