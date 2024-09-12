import { useContext, useEffect, useState } from 'react';

import {
  Box,
  alpha,
  Stack,
  lighten,
  Divider,
  IconButton,
  Tooltip,
  styled,
  useTheme,
  Button,
} from '@mui/material';
import MenuTwoToneIcon from '@mui/icons-material/MenuTwoTone';
import { SidebarContext } from 'contexts/SidebarContext';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';
import HeaderUserbox from './Userbox';
import { useSnackbar } from 'notistack';
import { Slide } from '@mui/material';
import useFirebaseUser from 'lib/useFirebaseUser';
import useFirebase from 'lib/useFirebase';
import { UserContext } from 'contexts/UserContext';
import { doc, getDoc } from 'firebase/firestore';

const HeaderWrapper = styled(Box)(
  ({ theme }) => `
        height: ${theme.header.height};
        color: ${theme.header.textColor};
        padding: ${theme.spacing(0, 2)};
        right: 0;
        z-index: 6;
        background-color: ${alpha(theme.header.background || 'white', 0.95)};
        backdrop-filter: blur(3px);
        position: fixed;
        justify-content: space-between;
        width: 100%;
        @media (min-width: ${theme.breakpoints.values.lg}px) {
            left: ${theme.sidebar.width};
            width: auto;
        }
`,
);

function Header() {
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const theme = useTheme();
  const { user, isLoading: loadingAuth } = useFirebaseUser();
  const { db } = useFirebase();
  const [loading, setLoading] = useState(true);
  const { userInfo } = useContext(UserContext);
  const [account, setAccount] = useState({
    nickname: '',
    wallet_address: '',
    image_url: '',
    invitation_code: '',
  });
  const { enqueueSnackbar } = useSnackbar();

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
            setAccount(result);
          }
          setLoading(false);
        } catch (error) {
          console.error(error);
        }
      } else {
        return;
      }
    };

    fetchData();
  }, [user, db, userInfo, setAccount, setLoading]);

  const invitationCode = account.invitation_code;
  const textToCopy = invitationCode;
  const [copied, setCopied] = useState(false);

  const copyToClipboard: any = () => {
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setCopied(true);
        enqueueSnackbar('Successfully copied!', {
          variant: 'success',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right',
          },
          autoHideDuration: 2000,
          TransitionComponent: Slide,
        });
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      },
      (err) => {
        console.log('failed to copy', err.mesage);
      },
    );
  };

  return (
    <HeaderWrapper
      display="flex"
      alignItems="center"
      sx={{
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 1px 0 ' +
              alpha(lighten(theme.colors.primary.main, 0.7), 0.15) +
              ', 0px 2px 8px -3px rgba(0, 0, 0, 0.2), 0px 5px 22px -4px rgba(0, 0, 0, .1)'
            : '0px 2px 8px -3px ' +
              alpha(theme.colors.alpha.black[100], 0.2) +
              ', 0px 5px 22px -4px ' +
              alpha(theme.colors.alpha.black[100], 0.1),
      }}
    >
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        alignItems="center"
        spacing={2}
      >
        <Button onClick={copyToClipboard} variant="outlined">
          {copied ? 'Copied' : invitationCode}
        </Button>
      </Stack>
      <Box display="flex" alignItems="center">
        <HeaderUserbox />
        <Box
          component="span"
          sx={{
            ml: 2,
            display: { lg: 'none', xs: 'inline-block' },
          }}
        >
          <Tooltip arrow title="Toggle Menu">
            <IconButton color="primary" onClick={toggleSidebar}>
              {!sidebarToggle ? (
                <MenuTwoToneIcon fontSize="small" />
              ) : (
                <CloseTwoToneIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </HeaderWrapper>
  );
}

export default Header;
