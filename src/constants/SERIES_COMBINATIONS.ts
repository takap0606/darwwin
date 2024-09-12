interface SeriesCombinations {
  [key: string]: string[];
  A: string[];
  B: string[];
  C: string[];
  D: string[];
  E: string[];
  F: string[];
  G: string[];
  H: string[];
  I: string[];
  J: string[];
}

export const SERIES_COMBINATIONS: SeriesCombinations = {
  // 第一弾シリーズ
  A: ['BTC', 'ETH', 'XRP', 'ATOM', 'PDT'],
  B: ['BTC', 'ETH', 'SOL', 'BNB', 'PDT'],
  C: ['BTC', 'ETH', 'ADA', 'DOT', 'PDT'],
  D: ['BTC', 'ETH', 'FIL', 'AVAX', 'PDT'],
  E: ['BTC', 'ETH', 'MATIC', 'SAND', 'PDT'],
  // 第二弾シリーズ
  F: ['BTC', 'ETH', 'XRP', 'TRX'],
  G: ['BTC', 'ETH', 'SOL', 'AVAX', 'ATOM'],
  H: ['BTC', 'ETH', 'PDT', 'XRP', 'LINK'],
  I: ['BTC', 'ETH', 'PDT', 'MATIC', 'DOGE'],
  J: ['BTC', 'ETH', 'PDT', 'LTC', 'XMR'],
};
