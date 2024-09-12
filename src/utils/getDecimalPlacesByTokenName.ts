import { TOKENS } from 'constants/TOKENS';

export const getDecimalPlacesByTokenName = (tokenName: string) => {
  const token = TOKENS.find((t) => t.tokenName === tokenName);
  return token ? token.numDecimalPlaces : null;
};
