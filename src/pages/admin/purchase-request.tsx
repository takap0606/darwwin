import Layout from 'components/common/Layout';
import AdminLayout from 'components/common/Layout/AdminLayout';
import { UserContext } from 'contexts/UserContext';
import useFirebaseUser from 'lib/useFirebaseUser';
import { useContext, useEffect } from 'react';
import { Grid } from '@mui/material';
import PurchaseRequestTable from 'features/admin/components/PurchaseRequestTable';

const AdminPurchaseRequest = () => {
  const { user } = useFirebaseUser();
  const { setUserInfo } = useContext(UserContext);

  useEffect(() => {
    const data = {
      nickname: '',
      walletAddress: user?.uid.toLocaleLowerCase() || '',
      peEmail: '',
      peUsername: '',
      registeredDate: '',
      imageUrl: '',
      invitationCode: '',
      rate: '',
    };
    setUserInfo(data);
  }, [user]);

  return (
    <Layout>
      <AdminLayout pageId="purchase-request">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={4}
        >
          <Grid item xs={12}>
            <PurchaseRequestTable transfered={false} />
          </Grid>
          <Grid item xs={12}>
            <PurchaseRequestTable transfered={true} />
          </Grid>
        </Grid>
      </AdminLayout>
    </Layout>
  );
};

export default AdminPurchaseRequest;
