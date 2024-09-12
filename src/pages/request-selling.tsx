import useFirebaseUser from 'lib/useFirebaseUser';
import { useContext, useEffect } from 'react';
import Layout from 'components/common/Layout';
import { UserContext } from 'contexts/UserContext';
import RequestForSellingContent from 'features/request-selling/components/RequestForSellingContent';
import { fetchTokenPrice } from 'utils/fetchTokenPrice';

const RequestForSelling = ({ tokenPrice }: any) => {
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
      <RequestForSellingContent tokenPrice={tokenPrice} />
    </Layout>
  );
};

export default RequestForSelling;

export const getServerSideProps = async () => {
  //トークン価格の取得
  const tokenPrice = await fetchTokenPrice();

  return {
    props: {
      tokenPrice: tokenPrice,
    },
  };
};
