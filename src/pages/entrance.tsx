import { Box, Button, Container } from '@mui/material';
import { useRouter } from 'next/router';

const Page = () => {
  const router = useRouter();
  const handleGoToTop = () => {
    router.push('/');
  };
  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" justifyContent="center" mt={8}>
        <Button onClick={handleGoToTop}>Go to Top</Button>
      </Box>
    </Container>
  );
};

export default Page;
