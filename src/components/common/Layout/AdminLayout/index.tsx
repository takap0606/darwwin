import DashboardPageHeader from 'components/ui/DashboardPageHeader';
import PageHeaderWrapper from 'components/ui/PageHeaderWrapper';
import Footer from 'components/common/Layout/Footer';

import { Grid } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import LinkList from 'features/admin/components/LinkList';
import allowedAddresses from 'features/admin/utils/allowedAddresses';
import { useRouter } from 'next/router';
import { UserContext } from 'contexts/UserContext';
import Loader from 'components/common/Loader';

const AdminLayout = ({
  children,
  pageId,
}: {
  children: any;
  pageId: string;
}) => {
  const router = useRouter();
  const { userInfo } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userInfo.walletAddress !== undefined) {
      if (!allowedAddresses.includes(userInfo.walletAddress)) {
        router.replace('/');
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  if (isLoading) return <Loader />;

  return (
    <>
      <PageHeaderWrapper>
        <DashboardPageHeader />
      </PageHeaderWrapper>
      <Grid
        sx={{
          px: 4,
        }}
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={4}
      >
        <Grid item md={12} xs={12}>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="stretch"
            spacing={4}
          >
            <Grid item xs={12}>
              <LinkList />
            </Grid>
            <Grid item xs={12} id={pageId}>
              {children}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default AdminLayout;
