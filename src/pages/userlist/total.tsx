import useFirebaseUser from 'lib/useFirebaseUser';
import { useContext, useEffect } from 'react';
import Layout from 'components/common/Layout';
import { UserContext } from 'contexts/UserContext';
import UserlistTotalContent from 'features/userlist/UserlistTotalContent';

const UserListTotal = () => {
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
      <UserlistTotalContent />
    </Layout>
  );
};

export default UserListTotal;
