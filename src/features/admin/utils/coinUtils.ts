export type CoinType =
  | 'btc'
  | 'eth'
  | 'xrp'
  | 'atom'
  | 'sol'
  | 'bnb'
  | 'ada'
  | 'dot'
  | 'fil'
  | 'avax'
  | 'matic'
  | 'sand'
  | 'pdt'
  | 'ltc';

export const orderPriority: { [key in CoinType]: number } = {
  btc: 1,
  eth: 2,
  xrp: 3,
  atom: 4,
  sol: 5,
  bnb: 6,
  ada: 7,
  dot: 8,
  fil: 9,
  avax: 10,
  matic: 11,
  sand: 12,
  pdt: 13,
  ltc: 14,
};

export const fetchCoinIcon = (coin: CoinType): string => {
  const iconMap: { [key in CoinType]: string } = {
    btc: '/static/images/tokens/btc.png',
    eth: '/static/images/tokens/eth.png',
    xrp: '/static/images/tokens/xrp.png',
    atom: '/static/images/tokens/atom.png',
    ltc: '/static/images/tokens/ltc.png',
    dot: '/static/images/tokens/dot.png',
    matic: '/static/images/tokens/matic.png',
    pdt: '/static/images/tokens/pdt.svg',
    bnb: '/static/images/tokens/bnb.png',
    sol: '/static/images/tokens/sol.png',
    ada: '/static/images/tokens/ada.png',
    fil: '/static/images/tokens/fil.png',
    avax: '/static/images/tokens/avax.png',
    sand: '/static/images/tokens/sand.png',
  };

  return iconMap[coin] || '/static/images/placeholders/logo/default_coin.png';
};
