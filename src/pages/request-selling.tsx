import useFirebaseUser from 'lib/useFirebaseUser';
import { useContext, useEffect, useState } from 'react';
import Layout from 'components/common/Layout';
import { UserContext } from 'contexts/UserContext';
import RequestForSellingContent from 'features/request-selling/components/RequestForSellingContent';
import { fetchTokenPrice } from 'utils/fetchTokenPrice';

const RequestForSelling = () => {
  const { user } = useFirebaseUser();
  const { setUserInfo } = useContext(UserContext);
  const [tokenPrice, setTokenPrice] = useState(null);

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

  useEffect(() => {
    const fetchTokenPriceAsync = async () => {
      const price: any = await fetchTokenPrice();
      setTokenPrice(price);
    };

    fetchTokenPriceAsync();
  }, []);

  return (
    <Layout>
      {tokenPrice && <RequestForSellingContent tokenPrice={tokenPrice} />}
    </Layout>
  );
};

export default RequestForSelling;
