import Layout from 'components/common/Layout';
import AdminLayout from 'components/common/Layout/AdminLayout';
import UserTable from 'features/admin/components/UserTable';
import { UserContext } from 'contexts/UserContext';
import useFirebaseUser from 'lib/useFirebaseUser';
import { useContext, useEffect } from 'react';

const AdminUserlist = () => {
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
      rate: 0,
    };
    setUserInfo(data);
  }, [user]);

  return (
    <Layout>
      <AdminLayout pageId="userlist">
        <UserTable />
      </AdminLayout>
    </Layout>
  );
};

export default AdminUserlist;
