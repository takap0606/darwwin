import Layout from 'components/common/Layout';
import AdminLayout from 'components/common/Layout/AdminLayout';
import { UserContext } from 'contexts/UserContext';
import useFirebaseUser from 'lib/useFirebaseUser';
import { useContext, useEffect, useState } from 'react';
import ParnterRewardCalculation from 'features/admin/components/PartnerRewardCalculation';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { TabPanelProps } from '@mui/lab';
import FastBonusCalculation from 'features/admin/components/FastBonusCalculation';

const TabPanel = (props: any) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const AffiliateCalculationPage = () => {
  const { user } = useFirebaseUser();
  const { setUserInfo } = useContext(UserContext);

  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  };

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
      <AdminLayout pageId="affiliate-calculation">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="Affiliate Tabs"
          >
            <Tab label="PARTNER REWARD" {...a11yProps(0)} />
            <Tab label="FAST BONUS" {...a11yProps(1)} />
            <Tab label="CAPITAL GAIN BONUS" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <ParnterRewardCalculation />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <FastBonusCalculation />
        </TabPanel>
        <TabPanel value={value} index={2}>
          Item Three
        </TabPanel>
      </AdminLayout>
    </Layout>
  );
};

export default AffiliateCalculationPage;
