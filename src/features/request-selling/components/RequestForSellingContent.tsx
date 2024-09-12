import DashboardPageHeader from 'components/ui/DashboardPageHeader';
import PageHeaderWrapper from 'components/ui/PageHeaderWrapper';
import Footer from 'components/common/Layout/Footer';

import { Grid } from '@mui/material';
import InvestContext from 'contexts/InvestContext';
import { useState } from 'react';
import InvestSelling from 'features/request-selling/components/InvestSelling';

const RequestForSellingContent = ({ tokenPrice }: any) => {
  const [shouldReload, setShouldReload] = useState<boolean>(false);

  return (
    <InvestContext.Provider value={{ shouldReload, setShouldReload }}>
      <PageHeaderWrapper>
        <DashboardPageHeader />
      </PageHeaderWrapper>
      <Grid
        sx={{ px: 4 }}
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={3}
      >
        <Grid item lg={12} xs={12}>
          <InvestSelling tokenPrice={tokenPrice} />
        </Grid>
      </Grid>
      <Footer />
    </InvestContext.Provider>
  );
};

export default RequestForSellingContent;
