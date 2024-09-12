import { TOKENS } from 'constants/TOKENS';

const createPortfolioForUltra = (tokenAmounts: any) => {
  const portfolio: any[] = [];

  TOKENS.forEach((tokenInfo) => {
    if (tokenAmounts[tokenInfo.tokenName.toLowerCase()] > 0) {
      portfolio.push(tokenInfo);
    }
  });

  return portfolio;
};

export default createPortfolioForUltra;
