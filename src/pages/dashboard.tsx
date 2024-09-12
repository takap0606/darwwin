import useFirebaseUser from 'lib/useFirebaseUser';
import { useContext, useEffect } from 'react';
import Layout from 'components/common/Layout';
import DashboardContent from 'features/dashboard/components/DashboardContent';
import { UserContext } from 'contexts/UserContext';
import { fetchTokenPrice } from 'utils/fetchTokenPrice';

const Dashboard = ({ tokenPrice }: any) => {
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
      <DashboardContent tokenPrice={tokenPrice} />
    </Layout>
  );
};

export default Dashboard;

export const getServerSideProps = async () => {
  //トークン価格の取得
  const tokenPrice = await fetchTokenPrice();

  return {
    props: {
      tokenPrice: tokenPrice,
    },
  };
};
