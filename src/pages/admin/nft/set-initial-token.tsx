import Layout from 'components/common/Layout';
import AdminLayout from 'components/common/Layout/AdminLayout';
import { UserContext } from 'contexts/UserContext';
import SetInitialToken from 'features/admin/components/SetInitialToken';
import useFirebaseUser from 'lib/useFirebaseUser';
import { useContext, useEffect } from 'react';

const AdminSetInitialToken = () => {
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
      rate: '0.00',
    };
    setUserInfo(data);
  }, [user]);

  return (
    <Layout>
      <AdminLayout pageId="set-initial-token">
        <SetInitialToken />
      </AdminLayout>
    </Layout>
  );
};

export default AdminSetInitialToken;
