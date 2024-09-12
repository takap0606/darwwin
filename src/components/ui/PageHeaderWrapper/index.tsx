import { FC, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { Box, styled } from '@mui/material';

const PageTitle = styled(Box)(
  ({ theme }) => `
        padding: ${theme.spacing(4)};
`,
);

type PageHeaderWrapperProps = {
  children?: ReactNode;
};

const PageHeaderWrapper: FC<PageHeaderWrapperProps> = ({ children }) => {
  return (
    <>
      <PageTitle className="MuiPageTitle-wrapper">{children}</PageTitle>
    </>
  );
};

PageHeaderWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PageHeaderWrapper;
