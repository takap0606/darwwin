import useFirebaseUser from 'lib/useFirebaseUser';
import { useContext, useEffect } from 'react';
import Layout from 'components/common/Layout';
import { UserContext } from 'contexts/UserContext';
import ProfileContent from 'features/profile/ProfileContent';

const Profile = () => {
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
      <ProfileContent />
    </Layout>
  );
};

export default Profile;
