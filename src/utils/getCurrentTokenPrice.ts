interface CryptoPrices {
  [key: string]: number;
}

const getCurrentTokenPrice = (
  tokenPrice: { data: { marketPrice: any[] } },
  tokenName: string,
) => {
  console.log(tokenPrice.data.marketPrice);
  const token = tokenPrice.data.marketPrice.find(
    (o: any) => o?.symbol === tokenName,
  );
  // console.log(token);
  return token ? token.indexPrice : 0;
};

export const createTokenTypes = (tokenPrice: any, tokenList: Array<string>) => {
  return tokenList.reduce<CryptoPrices>((acc, curr) => {
    acc[`${curr.toLowerCase()}Price`] = getCurrentTokenPrice(
      tokenPrice,
      `${curr}-USD`,
    );
    return acc;
  }, {});
};

export const getTokenList = () => {
  return [
    'BTC',
    'ETH',
    'PDT',
    'XRP',
    'ATOM',
    'SOL',
    'BNB',
    'ADA',
    'DOT',
    'FIL',
    'AVAX',
    'MATIC',
    'SAND',
    'LTC',
    'TRX',
    'LINK',
    'DOGE',
    'XMR',
  ];
};
