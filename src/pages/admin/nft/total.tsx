import Layout from 'components/common/Layout';
import AdminLayout from 'components/common/Layout/AdminLayout';
import NftTable from 'features/admin/components/NftTable';
import { UserContext } from 'contexts/UserContext';
import useFirebaseUser from 'lib/useFirebaseUser';
import { useContext, useEffect } from 'react';

const AdminNftsTotal = () => {
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
      <AdminLayout pageId="nftlist">
        <NftTable />
      </AdminLayout>
    </Layout>
  );
};

export default AdminNftsTotal;
