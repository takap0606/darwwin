import { FC, ReactNode, useContext, useEffect, useState } from 'react';
import { Box, alpha, lighten, useTheme } from '@mui/material';

import Sidebar from 'components/common/Layout/Siderbar';
import Header from 'components/common/Layout/Header';
import useFirebaseUser from 'lib/useFirebaseUser';
import { UserContext } from 'contexts/UserContext';
import { useRouter } from 'next/router';
import useFirebase from 'lib/useFirebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import SetInvitationCode from 'features/dashboard/components/SetInvitationCode';
import TermsModal from 'features/dashboard/components/TermsModal';

type Props = {
  children?: ReactNode;
};

const Layout: FC<Props> = ({ children }) => {
  const theme = useTheme();
  const { user, isLoading: loadingAuth } = useFirebaseUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isInvited, setIsInvited] = useState(true);
  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean | null>(null);
  const { userInfo } = useContext(UserContext);
  const { db } = useFirebase();
  const router = useRouter();

  const [hasError, setHasError] = useState(false); // 新しいエラーステート

  useEffect(() => {
    // ログイン状態が確定するまで何もしない
    if (loadingAuth) {
      return;
    }

    // ログインしていなければ / にリダイレクトする
    if (!user) {
      router.replace('/');
      return;
    }

    const fetchData = async () => {
      if (
        user &&
        db &&
        userInfo.walletAddress &&
        userInfo.walletAddress !== ''
      ) {
        const userRef = doc(db, 'users', userInfo.walletAddress);

        try {
          const userdata = await getDoc(userRef);
          const userDataExists = userdata.exists() && userdata.data();
          const invitationConfirmed =
            userDataExists && userdata.data().invitation_confirmed;

          if (!userDataExists || invitationConfirmed === undefined) {
            await setDoc(
              userRef,
              {
                wallet_address: userInfo.walletAddress,
                invitation_confirmed: false,
                terms_accepted: false,
              },
              { merge: true },
            );
            setIsInvited(false);
            setIsTermsAccepted(false); // 初期状態では規約は未承認
          } else if (invitationConfirmed === false) {
            setIsInvited(false);
          } else {
            setIsTermsAccepted(
              userDataExists && userdata.data().terms_accepted,
            ); // Firestoreから規約承認状態を読み込む
          }
          setIsLoading(false);
        } catch (error) {
          console.error(error);
          setHasError(true);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [user, loadingAuth, router, db, userInfo]);

  if (hasError) {
    return <div>Error occurred while fetching data. Please try again.</div>;
  }

  // ローディング中は何も表示しない
  if (loadingAuth || isLoading) {
    return null;
  }

  if (!isInvited) {
    return <SetInvitationCode userInfo={userInfo} db={db} />;
  }

  if (
    (isInvited && isTermsAccepted === false) ||
    isTermsAccepted === undefined
  ) {
    return <TermsModal userInfo={userInfo} db={db} />;
  }

  return (
    <>
      <Box
        sx={{
          flex: 1,
          height: '100%',

          '.MuiPageTitle-wrapper': {
            background:
              theme.palette.mode === 'dark'
                ? theme.colors.alpha.trueWhite[5]
                : theme.colors.alpha.white[50],
            marginBottom: `${theme.spacing(4)}`,
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 1px 0 ' +
                  alpha(lighten(theme.colors.primary.main, 0.7), 0.15) +
                  ', 0px 2px 4px -3px rgba(0, 0, 0, 0.2), 0px 5px 12px -4px rgba(0, 0, 0, .1)'
                : '0px 2px 4px -3px ' +
                  alpha(theme.colors.alpha.black[100], 0.1) +
                  ', 0px 5px 12px -4px ' +
                  alpha(theme.colors.alpha.black[100], 0.05),
          },
        }}
      >
        <Header />
        <Sidebar />
        <Box
          sx={{
            position: 'relative',
            zIndex: 5,
            display: 'block',
            flex: 1,
            pt: `${theme.header.height}`,
            [theme.breakpoints.up('lg')]: {
              ml: `${theme.sidebar.width}`,
            },
          }}
        >
          <Box display="block">{children}</Box>
        </Box>
      </Box>
    </>
  );
};

export default Layout;
