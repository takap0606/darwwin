import {
  Box,
  Tooltip,
  TooltipProps,
  tooltipClasses,
  styled,
  Link,
} from '@mui/material';
import useFirebaseUser from 'lib/useFirebaseUser';

const LogoWrapper = styled(Link)(
  ({ theme }) => `
        color: ${theme.palette.text.primary};
        display: flex;
        text-decoration: none;
        width: 53px;
        margin: 0 auto;
        font-weight: ${theme.typography.fontWeightBold};
`,
);

const LogoSignWrapper = styled(Box)(
  () => `
        width: 42px;
        height: 42px;
`,
);

const TooltipWrapper = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.colors.alpha.trueWhite[100],
    color: theme.palette.getContrastText(theme.colors.alpha.trueWhite[100]),
    fontSize: theme.typography.pxToRem(12),
    fontWeight: 'bold',
    borderRadius: theme.general.borderRadiusSm,
    boxShadow:
      '0 .2rem .8rem rgba(7,9,25,.18), 0 .08rem .15rem rgba(7,9,25,.15)',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.colors.alpha.trueWhite[100],
  },
}));

function Logo() {
  const href = '/dashboard';
  const { user, isLoading } = useFirebaseUser();

  return (
    <TooltipWrapper title={'DARWWIN Dashboard'} arrow>
      {!isLoading && user ? (
        <LogoWrapper href={href}>
          <LogoSignWrapper>
            <img src="/static/darwwin_logo_square.png" alt="" width={'42px'} />
          </LogoSignWrapper>
        </LogoWrapper>
      ) : (
        <LogoWrapper href="/">
          <LogoSignWrapper>
            <img src="/static/darwwin_logo_square.png" alt="" width={'42px'} />
          </LogoSignWrapper>
        </LogoWrapper>
      )}
    </TooltipWrapper>
  );
}

export default Logo;
