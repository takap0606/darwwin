import { useContext, useEffect, useRef, useState } from 'react';

import {
  Avatar,
  Box,
  Button,
  Divider,
  MenuList,
  alpha,
  IconButton,
  MenuItem,
  ListItemText,
  Popover,
  Typography,
  styled,
  useTheme,
  Link,
} from '@mui/material';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';
import ChevronRightTwoToneIcon from '@mui/icons-material/ChevronRightTwoTone';
import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import initializeFirebaseClient from 'lib/initFirebase';
import useFirebaseUser from 'lib/useFirebaseUser';
import useFirebase from 'lib/useFirebase';
import { UserContext } from 'contexts/UserContext';
import { doc, getDoc } from 'firebase/firestore';

const UserBoxButton = styled(IconButton)(
  ({ theme }) => `
  width: ${theme.spacing(4)};
  padding: 0;
  height: ${theme.spacing(4)};
  margin-left: ${theme.spacing(1)};
  border-radius: ${theme.general.borderRadiusLg};
  
  &:hover {
    background: ${theme.colors.primary.main};
  }
`,
);

const UserAvatar = styled(Avatar)(
  ({ theme }) => `
        height: 90%;
        width: 90%;
        border-radius: ${theme.general.borderRadiusLg};
`,
);

const MenuListWrapperPrimary = styled(MenuList)(
  ({ theme }) => `
  padding: ${theme.spacing(2)};

  & .MuiMenuItem-root {
      border-radius: 50px;
      padding: ${theme.spacing(1, 1, 1, 2.5)};
      min-width: 200px;
      margin-bottom: 2px;
      position: relative;
      color: ${theme.colors.alpha.black[100]};

      &.Mui-selected,
      &:hover,
      &.MuiButtonBase-root:active {
          background: ${theme.colors.primary.lighter};
          color: ${theme.colors.primary.main};
      }

      &:last-child {
          margin-bottom: 0;
      }
    }
`,
);

const MenuUserBox = styled(Box)(
  ({ theme }) => `
        background: ${alpha(theme.colors.alpha.black[100], 0.08)};
        padding: ${theme.spacing(2)};
`,
);

const UserBoxText = styled(Box)(
  ({ theme }) => `
        text-align: left;
        padding-left: ${theme.spacing(1)};
`,
);

const UserBoxLabel = styled(Typography)(
  ({ theme }) => `
        font-weight: ${theme.typography.fontWeightBold};
        color: ${theme.palette.secondary.main};
        display: block;
`,
);

const UserBoxDescription = styled(Typography)(
  ({ theme }) => `
        color: ${theme.palette.secondary.light}
`,
);

function HeaderUserbox() {
  const theme = useTheme();
  const router = useRouter();
  const { auth } = initializeFirebaseClient();

  const [loading, setLoading] = useState(true);
  const { user } = useFirebaseUser();
  const { db } = useFirebase();
  const { userInfo } = useContext(UserContext);
  const [account, setAccount] = useState({
    nickname: '',
    wallet_address: '',
    image_url: '',
    invitation_code: '',
    rate: '0.00',
  });

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

  const ref = useRef<any>(null);
  const [isOpen, setOpen] = useState<boolean>(false);

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  return (
    <>
      <UserBoxButton color="primary" ref={ref} onClick={handleOpen}>
        {!loading &&
          (account.image_url !== undefined ? (
            <UserAvatar alt={account.nickname} src={account.image_url} />
          ) : (
            <UserAvatar
              alt={account.nickname}
              src="/static/images/avatars/sample_avatar.png"
            />
          ))}
      </UserBoxButton>
      <Popover
        disableScrollLock
        anchorEl={ref.current}
        onClose={handleClose}
        open={isOpen}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuUserBox
          sx={{
            minWidth: 210,
          }}
          display="flex"
        >
          {!loading &&
            (account.image_url !== undefined ? (
              <Avatar
                sx={{
                  backgroundColor: '#fff',
                }}
                variant="rounded"
                alt={account.nickname}
                src={account.image_url}
              />
            ) : (
              <Avatar
                sx={{
                  backgroundColor: '#fff',
                }}
                variant="rounded"
                alt={account.nickname}
                src="/static/images/avatars/sample_avatar.png"
              />
            ))}
          <UserBoxText>
            <UserBoxLabel variant="body1">{account.nickname}</UserBoxLabel>
            {account.rate !== '0.00' && (
              <UserBoxDescription variant="body2">
                RATE: {(Number(account.rate) * 100).toFixed(0)}%
              </UserBoxDescription>
            )}
          </UserBoxText>
        </MenuUserBox>
        <Divider
          sx={{
            mb: 0,
          }}
        />
        <MenuListWrapperPrimary disablePadding>
          <Link href="/dashboard">
            <MenuItem>
              <ListItemText
                primaryTypographyProps={{
                  variant: 'h5',
                }}
                primary={'Dashboard'}
              />
              <ChevronRightTwoToneIcon
                sx={{
                  color: `${theme.colors.alpha.black[30]}`,
                  opacity: 0.8,
                }}
              />
            </MenuItem>
          </Link>
          <Link>
            <MenuItem>
              <ListItemText
                primaryTypographyProps={{
                  variant: 'h5',
                }}
                primary={'User List'}
              />
              <ChevronRightTwoToneIcon
                sx={{
                  color: `${theme.colors.alpha.black[30]}`,
                  opacity: 0.8,
                }}
              />
            </MenuItem>
          </Link>
          <Link href="/profile">
            <MenuItem>
              <ListItemText
                primaryTypographyProps={{
                  variant: 'h5',
                }}
                primary={'User Profile'}
              />
              <Box display="flex" alignItems="center">
                <ChevronRightTwoToneIcon
                  sx={{
                    ml: 1,
                    color: `${theme.colors.alpha.black[30]}`,
                    opacity: 0.8,
                  }}
                />
              </Box>
            </MenuItem>
          </Link>
          <Link href="/reports">
            <MenuItem>
              <ListItemText
                primaryTypographyProps={{
                  variant: 'h5',
                }}
                primary={'Affiliate Reward'}
              />
              <Box display="flex" alignItems="center">
                <ChevronRightTwoToneIcon
                  sx={{
                    ml: 1,
                    color: `${theme.colors.alpha.black[30]}`,
                    opacity: 0.8,
                  }}
                />
              </Box>
            </MenuItem>
          </Link>
          <Link href="/request-selling">
            <MenuItem>
              <ListItemText
                primaryTypographyProps={{
                  variant: 'h5',
                }}
                primary={'Request for Selling'}
              />
              <Box display="flex" alignItems="center">
                <ChevronRightTwoToneIcon
                  sx={{
                    ml: 1,
                    color: `${theme.colors.alpha.black[30]}`,
                    opacity: 0.8,
                  }}
                />
              </Box>
            </MenuItem>
          </Link>
        </MenuListWrapperPrimary>
        <Divider />
        <Box m={1}>
          <Button
            color="primary"
            fullWidth
            onClick={async () => (await router.replace('/')) && signOut(auth)}
          >
            <LockOpenTwoToneIcon
              sx={{
                mr: 1,
              }}
            />
            {'Sign out'}
          </Button>
        </Box>
      </Popover>
    </>
  );
}

export default HeaderUserbox;
