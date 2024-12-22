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
  | 'ltc'
  | 'trx'
  | 'link'
  | 'doge'
  | 'xmr'
  | 'pdt'
  | 'pepe'
  | 'sui'
  | 'near'
  | 'gala'
  | 'apt'
  | 'fet';

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
  trx: 14,
  link: 15,
  doge: 16,
  xmr: 17,
  pepe: 18,
  sui: 19,
  near: 20,
  gala: 21,
  apt: 22,
  fet: 23,
  ltc: 24,
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
    pepe: '/static/images/tokens/pepe.png',
    sui: '/static/images/tokens/sui.png',
    near: '/static/images/tokens/near.png',
    gala: '/static/images/tokens/gala.png',
    apt: '/static/images/tokens/apt.png',
    fet: '/static/images/tokens/fet.png',
    trx: '/static/images/tokens/trx.png',
    link: '/static/images/tokens/link.png',
    doge: '/static/images/tokens/doge.png',
    xmr: '/static/images/tokens/xmr.png',
  };

  return iconMap[coin] || '/static/images/placeholders/logo/default_coin.png';
};
