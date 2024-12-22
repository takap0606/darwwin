import { getBybitPrice } from 'lib/bybitClient';
import { getParadisePrice } from 'lib/paradiseClient';
import type { NextApiRequest, NextApiResponse } from 'next';

const PARADISE_SYMBOLS = ['PDT', 'XMR'];
const BYBIT_SYMBOLS = [
  'BTC',
  'ETH',
  'XRP',
  'ATOM',
  'SOL',
  'BNB',
  'ADA',
  'DOT',
  'FIL',
  'AVAX',
  'POL',
  'SAND',
  'LTC',
  'TRX',
  'LINK',
  'DOGE',
  'ICP',
  'PEPE',
  'SUI',
  'NEAR',
  'GALA',
  'APT',
  'FET',
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // Paradise Exchangeからの価格取得
    const paradisePrices = await Promise.all(
      PARADISE_SYMBOLS.map(getParadisePrice),
    );
    console.log('paradisePrices', paradisePrices);

    // Bybitからの価格取得
    const bybitPrices = await Promise.all(BYBIT_SYMBOLS.map(getBybitPrice));
    console.log('bybitPrices', bybitPrices);

    // 結果の結合とnullの除外
    const marketPrice = [...paradisePrices, ...bybitPrices].filter(
      (price) => price !== null,
    );

    res.status(200).json({ marketPrice });
  } catch (error) {
    console.error('Error processing market prices:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
