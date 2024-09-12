import Layout from 'components/common/Layout';
import AdminCurationLayout from 'components/common/Layout/AdminCurationLayout';
import NftTable from 'features/adminCuration/NftTable';
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
      rate: 0,
    };
    setUserInfo(data);
  }, [user]);

  return (
    <Layout>
      <AdminCurationLayout pageId="nftlist">
        <NftTable />
      </AdminCurationLayout>
    </Layout>
  );
};

export default AdminNftsTotal;
