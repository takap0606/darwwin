import { SERIES_COMBINATIONS } from 'constants/SERIES_COMBINATIONS';
import { TOKENS } from 'constants/TOKENS';

export const createPortfolio = (series: string) => {
  if (series === 'None') return [];
  if (!SERIES_COMBINATIONS.hasOwnProperty(series)) {
    throw new Error(`Invalid series identifier: ${series}`);
  }

  const tokenPrimaryList = SERIES_COMBINATIONS[series];
  const portfolio = TOKENS.filter((token) => {
    const index = tokenPrimaryList.indexOf(token.primary);
    return index !== -1;
  }).sort((a, b) => {
    const indexA = tokenPrimaryList.indexOf(a.primary);
    const indexB = tokenPrimaryList.indexOf(b.primary);
    return indexA - indexB;
  });

  return portfolio;
};
