import { useContext } from 'react';
import Scrollbar from 'components/ui/Scrollbar';
import { SidebarContext } from 'contexts/SidebarContext';

import {
  Box,
  Drawer,
  alpha,
  styled,
  Divider,
  useTheme,
  lighten,
  darken,
} from '@mui/material';

import SidebarTopSection from './SidebarTopSection';
import SidebarMenu from './SidebarMenu';
import SidebarFooter from './SidebarFooter';
import Logo from 'components/ui/LogoSign';

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.sidebar.width};
        min-width: ${theme.sidebar.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
        padding-bottom: 61px;
`,
);

function Sidebar() {
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const closeSidebar = () => toggleSidebar();
  const theme = useTheme();

  return (
    <>
      <SidebarWrapper
        sx={{
          display: {
            xs: 'none',
            lg: 'inline-block',
          },
          position: 'fixed',
          left: 0,
          top: 0,
          background:
            theme.palette.mode === 'dark'
              ? alpha(lighten(theme.header.background || 'white', 0.1), 0.5)
              : darken(theme.colors.alpha.black[100], 0.5),
          boxShadow:
            theme.palette.mode === 'dark' ? theme.sidebar.boxShadow : 'none',
        }}
      >
        <Scrollbar>
          <Box mt={3}>
            <Box
              mx={2}
              sx={{
                width: 52,
              }}
            >
              <Logo />
            </Box>
          </Box>
          <Divider
            sx={{
              my: theme.spacing(3),
              mx: theme.spacing(2),
              background: theme.colors.alpha.trueWhite[10],
            }}
          />
          <SidebarTopSection />
          <Divider
            sx={{
              my: theme.spacing(3),
              mx: theme.spacing(2),
              background: theme.colors.alpha.trueWhite[10],
            }}
          />
          <SidebarMenu />
        </Scrollbar>
        <Divider
          sx={{
            background: theme.colors.alpha.trueWhite[10],
          }}
        />
        <SidebarFooter />
      </SidebarWrapper>
      <Drawer
        sx={{
          boxShadow: `${theme.sidebar.boxShadow}`,
        }}
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={sidebarToggle}
        onClose={closeSidebar}
        variant="temporary"
        elevation={9}
      >
        <SidebarWrapper
          sx={{
            background:
              theme.palette.mode === 'dark'
                ? theme.colors.alpha.white[100]
                : darken(theme.colors.alpha.black[100], 0.5),
          }}
        >
          <Scrollbar>
            <Box mt={3}>
              <Box
                mx={2}
                sx={{
                  width: 52,
                }}
              >
                <Logo />
              </Box>
            </Box>
            <Divider
              sx={{
                my: theme.spacing(3),
                mx: theme.spacing(2),
                background: theme.colors.alpha.trueWhite[10],
              }}
            />
            <SidebarTopSection />
            <Divider
              sx={{
                my: theme.spacing(3),
                mx: theme.spacing(2),
                background: theme.colors.alpha.trueWhite[10],
              }}
            />
            <SidebarMenu />
          </Scrollbar>
          <SidebarFooter />
        </SidebarWrapper>
      </Drawer>
    </>
  );
}

export default Sidebar;
