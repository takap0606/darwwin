import Layout from 'components/common/Layout';
import AdminLayout from 'components/common/Layout/AdminLayout';
import { UserContext } from 'contexts/UserContext';
import RequestSellingDetail from 'features/admin/components/RequestSellingDetail';
import useFirebaseUser from 'lib/useFirebaseUser';
import { useContext, useEffect } from 'react';

const Page = () => {
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
      <AdminLayout pageId="user-detail">
        <RequestSellingDetail />
      </AdminLayout>
    </Layout>
  );
};

export default Page;
