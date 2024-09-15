import Layout from 'components/common/Layout';
import AdminCurationLayout from 'components/common/Layout/AdminCurationLayout';
import UserTable from 'features/adminCuration/UserTable';
import { UserContext } from 'contexts/UserContext';
import useFirebaseUser from 'lib/useFirebaseUser';
import { useContext, useEffect } from 'react';

const AdminCuration = () => {
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
      <AdminCurationLayout pageId="userlist">
        <UserTable />
      </AdminCurationLayout>
    </Layout>
  );
};

export default AdminCuration;
