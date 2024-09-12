import Layout from 'components/common/Layout';
import AdminLayout from 'components/common/Layout/AdminLayout';
import AssetControl from 'features/admin/components/AssetControl';
import { UserContext } from 'contexts/UserContext';
import useFirebaseUser from 'lib/useFirebaseUser';
import { useContext, useEffect } from 'react';

const AffiliateControlPage = () => {
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
      <AdminLayout pageId="asset-control">
        <AssetControl />
      </AdminLayout>
    </Layout>
  );
};

export default AffiliateControlPage;
