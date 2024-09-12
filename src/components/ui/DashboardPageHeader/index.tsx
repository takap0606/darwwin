import { Typography, Avatar, Grid, Box, useTheme } from '@mui/material';
import { UserContext } from 'contexts/UserContext';
import { doc, getDoc } from 'firebase/firestore';
import useFirebase from 'lib/useFirebase';
import useFirebaseUser from 'lib/useFirebaseUser';
import { useContext, useEffect } from 'react';

const DashboardPageHeader = () => {
  const theme = useTheme();
  const { user } = useFirebaseUser();
  const { db } = useFirebase();
  const { userInfo, setUserInfo } = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      if (
        user &&
        db &&
        userInfo.walletAddress &&
        userInfo.walletAddress !== ''
      ) {
        const userRef = doc(db, 'users', userInfo.walletAddress);

        try {
          const docSnapshot = await getDoc(userRef);
          if (docSnapshot.exists()) {
            const result: any = docSnapshot.data();
            setUserInfo({
              nickname: result.nickname,
              walletAddress: result.wallet_address,
              peEmail: result.pe_email,
              peUsername: result.pe_username,
              registeredDate: result.registered_date,
              imageUrl: result.image_url,
              invitationCode: result.invitation_code,
              rate: result.rate,
            });
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        return;
      }
    };
    fetchData();
  }, [user, db, userInfo.walletAddress, setUserInfo]);

  return (
    <Grid container alignItems="center">
      <Grid item>
        <Box
          sx={{
            backgroundColor: '#fff',
            mr: 2,
            borderRadius: '25%',
          }}
        >
          {userInfo.imageUrl !== undefined ? (
            <Avatar
              sx={{
                width: theme.spacing(6),
                height: theme.spacing(6),
                borderRadius: '25%',
              }}
              alt=""
              src={userInfo.imageUrl}
            />
          ) : (
            <Avatar
              sx={{
                p: 0.6,
                width: theme.spacing(6),
                height: theme.spacing(6),
              }}
              alt=""
              src="/static/images/avatars/sample_avatar.svg"
            />
          )}
        </Box>
      </Grid>
      <Grid item overflow="hidden">
        <Typography variant="h3" component="h3" gutterBottom noWrap>
          {'Welcome'},{' '}
          {userInfo.nickname === undefined
            ? userInfo.walletAddress
            : userInfo.nickname}
          !
        </Typography>
        <Typography variant="subtitle2">
          {'Today is a good day to start asset management'}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default DashboardPageHeader;
