import useFirebaseUser from 'lib/useFirebaseUser';
import { useContext, useEffect } from 'react';
import Layout from 'components/common/Layout';
import { UserContext } from 'contexts/UserContext';
import UserlistContent from 'features/userlist/UserlistContent';

const UserList = () => {
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
      <UserlistContent />
    </Layout>
  );
};

export default UserList;
