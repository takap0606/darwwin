import Layout from 'components/common/Layout';
import AdminLayout from 'components/common/Layout/AdminLayout';
import NftTable from 'features/admin/components/NftTable';
import { UserContext } from 'contexts/UserContext';
import useFirebaseUser from 'lib/useFirebaseUser';
import { useContext, useEffect } from 'react';
import { fetchTokenPrice } from 'utils/fetchTokenPrice';
import NftDetailContent from 'features/admin/components/NftDetailContent';

const AdminNftsDetail = ({ tokenPrice }: { tokenPrice: any }) => {
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
        <NftDetailContent tokenPrice={tokenPrice} />
      </AdminLayout>
    </Layout>
  );
};

export default AdminNftsDetail;

export const getServerSideProps = async () => {
  //トークン価格の取得
  const tokenPrice = await fetchTokenPrice();

  return {
    props: {
      tokenPrice: tokenPrice,
    },
  };
};
