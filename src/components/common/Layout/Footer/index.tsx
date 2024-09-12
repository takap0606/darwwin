import { Box, Button, Card, Modal, Typography, styled } from '@mui/material';
import PrivacyPolicy from 'features/dashboard/components/PrivacyPolicy';
import { useState } from 'react';

const FooterWrapper = styled(Card)(
  ({ theme }) => `
        border-radius: 0;
        margin-top: ${theme.spacing(4)};
`,
);

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  background:
    'linear-gradient(180deg,rgba(35,30,33,.8),rgba(21,25,28,.99)),#171a1e',
};

function Footer() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <FooterWrapper className="footer-wrapper">
        <Box
          p={4}
          display={{ xs: 'block', md: 'flex' }}
          alignItems="center"
          textAlign={{ xs: 'center', md: 'left' }}
          justifyContent="space-between"
        >
          {/* FIXME: Privacy Policy */}
          {/* <Button onClick={handleOpen}>Privacy Policy</Button> */}
          <Box>
            <Typography variant="subtitle1">&copy; 2024 - DARWWIN</Typography>
          </Box>
        </Box>
      </FooterWrapper>

      {/* <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box display="flex" alignItems="center">
            <Box pl={1}>
              <PrivacyPolicy handleClose={handleClose} />
            </Box>
          </Box>
        </Box>
      </Modal> */}
    </>
  );
}

export default Footer;
