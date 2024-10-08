import Layout from 'components/common/Layout';
import AdminLayout from 'components/common/Layout/AdminLayout';
import Series from 'features/admin/components/Series';
import { UserContext } from 'contexts/UserContext';
import useFirebaseUser from 'lib/useFirebaseUser';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import UltraSeries from 'features/admin/components/UltraSeries';

const AdminSeries = () => {
  const { user } = useFirebaseUser();
  const { setUserInfo } = useContext(UserContext);
  const router = useRouter();
  const { series } = router.query;

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
      <AdminLayout pageId="userlist">
        {series !== undefined &&
          (series === 'ultra' ? (
            <UltraSeries />
          ) : (
            <Series series={series.toLocaleString().toUpperCase()} />
          ))}
      </AdminLayout>
    </Layout>
  );
};

export default AdminSeries;
