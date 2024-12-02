import { useState, forwardRef, Ref, ReactElement } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import {
  Box,
  Card,
  TextField,
  Typography,
  Container,
  Alert,
  Slide,
  Dialog,
  Collapse,
  Button,
  Avatar,
  IconButton,
  styled,
} from '@mui/material';
import Head from 'next/head';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';

import Logo from 'components/ui/LogoSign';
import CheckTwoToneIcon from '@mui/icons-material/CheckTwoTone';
import Layout from 'components/common/Layout';
import initializeFirebaseClient from 'lib/initFirebase';
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

const Transition = forwardRef(function Transition(
  props: { children?: ReactElement },
  ref: Ref<any>,
) {
  const { children, ...otherProps } = props;
  return children ? (
    <Slide direction="down" ref={ref} {...otherProps}>
      {children}
    </Slide>
  ) : null;
});

const MainContent = styled(Box)(
  () => `
      height: 100%;
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      justify-content: center;
  `,
);

const DialogWrapper = styled(Dialog)(
  () => `
        .MuiDialog-paper {
          overflow: visible;
        }
  `,
);

const AvatarSuccess = styled(Avatar)(
  ({ theme }) => `
        background-color: ${theme.colors.success.main};
        color: ${theme.palette.success.contrastText};
        width: ${theme.spacing(12)};
        height: ${theme.spacing(12)};
        box-shadow: ${theme.colors.shadows.success};
        top: -${theme.spacing(6)};
        position: absolute;
        left: 50%;
        margin-left: -${theme.spacing(6)};
  
        .MuiSvgIcon-root {
          font-size: ${theme.typography.pxToRem(45)};
        }
  `,
);

function SetInvitationCode({ userInfo, db }: { userInfo: any; db: any }) {
  const { auth } = initializeFirebaseClient();
  const router = useRouter();

  const [openAlert, setOpenAlert] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    window.location.reload();
  };

  return (
    <>
      <Head>
        <title>Set Invitation Code</title>
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
                Set Invitation Code
              </Typography>
              <Typography
                variant="h4"
                color="text.secondary"
                fontWeight="normal"
                sx={{
                  mb: 3,
                }}
              >
                Please enter an invitation code and your nickname to login
              </Typography>
            </Box>

            <Formik
              initialValues={{
                invitation_code: '',
                nickname: '',
              }}
              validationSchema={Yup.object().shape({
                invitation_code: Yup.string()
                  .max(100, 'Too Long!')
                  .min(4, 'Too Short!')
                  .required('Invitation code is required')
                  .test('Invitation code is invalid', async function (value) {
                    if (value === undefined) return true;
                    const q = query(
                      collection(db, 'users'),
                      where('invitation_code', '==', value),
                    );
                    const snapshot = await getDocs(q);
                    if (snapshot.docs.length > 0) {
                      return true;
                    } else {
                      return false;
                    }
                  }),
                nickname: Yup.string()
                  .max(20, 'Too Long!')
                  .min(4, 'Too Short!')
                  .required('Nickname is required'),
              })}
              onSubmit={async (
                _values,
                { setErrors, setStatus, setSubmitting },
              ) => {
                try {
                  const userRef = doc(db, 'users', userInfo.walletAddress);
                  const crypto = require('crypto');
                  const S =
                    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                  const N = 8;
                  const random_invitation_code = Array.from(
                    crypto.randomFillSync(new Uint8Array(N)),
                  )
                    .map((n: any) => S[n % S.length])
                    .join('');
                  await setDoc(
                    userRef,
                    {
                      wallet_address: userInfo.walletAddress,
                      invitation_code: random_invitation_code,
                      invited_code: _values.invitation_code,
                      nickname: _values.nickname,
                      invitation_confirmed: true,
                      registered_date: serverTimestamp(),
                      rate: '0.10',
                    },
                    { merge: true },
                  );
                  setStatus({ success: true });
                  setSubmitting(false);
                  handleOpenDialog();
                } catch (err) {
                  if (err instanceof Error) {
                    console.error(err);
                    setStatus({ success: false });
                    setSubmitting(false);
                  } else {
                    console.error('An unexpected error occurred:', err);
                    setStatus({ success: false });
                    setSubmitting(false);
                  }
                }
              }}
            >
              {({
                errors,
                handleBlur,
                handleChange,
                handleSubmit,
                touched,
                values,
              }) => (
                <form noValidate onSubmit={handleSubmit}>
                  <TextField
                    error={Boolean(
                      touched.invitation_code && errors.invitation_code,
                    )}
                    fullWidth
                    helperText={
                      touched.invitation_code && errors.invitation_code
                    }
                    label="Invitation code"
                    margin="normal"
                    name="invitation_code"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="text"
                    value={values.invitation_code}
                    variant="outlined"
                  />

                  <TextField
                    error={Boolean(touched.nickname && errors.nickname)}
                    fullWidth
                    helperText={touched.nickname && errors.nickname}
                    label="Nickname"
                    margin="normal"
                    name="nickname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    type="text"
                    value={values.nickname}
                    variant="outlined"
                  />

                  <Button
                    sx={{
                      mt: 3,
                    }}
                    color="primary"
                    disabled={Boolean(
                      touched.invitation_code && errors.nickname,
                    )}
                    type="submit"
                    fullWidth
                    size="large"
                    variant="contained"
                  >
                    Set Invitation Code
                  </Button>
                  <Button
                    sx={{
                      mt: 3,
                    }}
                    onClick={async () =>
                      void signOut(auth) && router.replace('/')
                    }
                    color="primary"
                    type="submit"
                    fullWidth
                    size="large"
                    variant="contained"
                  >
                    I already entered the code
                  </Button>
                </form>
              )}
            </Formik>
          </Card>
        </Container>
      </MainContent>

      <DialogWrapper
        open={openDialog}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseDialog}
      >
        <Box
          sx={{
            px: 2,
            pb: 4,
            pt: 10,
          }}
        >
          <AvatarSuccess>
            <CheckTwoToneIcon />
          </AvatarSuccess>

          <Collapse in={openAlert}>
            <Alert
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setOpenAlert(false);
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              severity="info"
            >
              The invitation code you entered has been confirmed and
              successfully registered.
            </Alert>
          </Collapse>

          <Typography
            align="center"
            sx={{
              py: 4,
              px: 2,
            }}
            variant="h3"
          >
            Welcome to DARWWIN!
          </Typography>

          <Button
            fullWidth
            size="large"
            variant="contained"
            onClick={handleCloseDialog}
          >
            Dashboard
          </Button>
        </Box>
      </DialogWrapper>
    </>
  );
}

export default SetInvitationCode;

SetInvitationCode.getLayout = function getLayout(page: any) {
  return <Layout>{page}</Layout>;
};
