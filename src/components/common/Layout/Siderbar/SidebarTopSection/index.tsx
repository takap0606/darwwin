import { useContext, useEffect, useState } from 'react';

import { Avatar, Box, Typography, useTheme } from '@mui/material';
import { UserContext } from 'contexts/UserContext';

function SidebarTopSection() {
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const { userInfo } = useContext(UserContext);

  return (
    <Box
      sx={{
        textAlign: 'center',
        mx: 2,
        pt: 1,
        position: 'relative',
      }}
    >
      {!loading &&
        (userInfo.imageUrl !== undefined ? (
          <Avatar
            sx={{
              width: 68,
              height: 68,
              mb: 2,
              mx: 'auto',
              backgroundColor: '#fff',
            }}
            alt={userInfo.nickname}
            src={userInfo.imageUrl}
          />
        ) : (
          <Avatar
            sx={{
              width: 68,
              height: 68,
              mb: 2,
              mx: 'auto',
              p: 0.8,
              backgroundColor: '#fff',
            }}
            alt={userInfo.nickname}
            src="/static/images/avatars/sample_avatar.svg"
          />
        ))}

      <Typography
        variant="h4"
        sx={{
          color: `${theme.colors.alpha.trueWhite[100]}`,
        }}
      >
        {userInfo.nickname}
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          color: `${theme.colors.alpha.trueWhite[70]}`,
        }}
      >
        RATE: {(userInfo.rate ? userInfo.rate * 100 : 0).toFixed(0)}%
      </Typography>
    </Box>
  );
}

export default SidebarTopSection;
