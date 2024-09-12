// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios';

const getUrl = (serviceType: string, endpoint: any) =>
  `https://api.paradise.exchange/${serviceType}${endpoint}`;
const getSpotUrl = (endpoint: string) => getUrl('spot', endpoint);

export default async function handler(
  req: any,
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { marketPrice: any }): void; new (): any };
    };
  },
) {
  const symbols = [
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
  ].map((symbol) => `${symbol}-USD`);

  const getMarketPrice = async (symbol: string) => {
    const endpoint = `/api/v3.2/price?symbol=${symbol}`;
    try {
      const res = await axios.get(getSpotUrl(endpoint));
      return res.data;
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return null;
    }
  };

  const marketPrices = await Promise.all(symbols.map(getMarketPrice));
  const marketPrice = marketPrices.flat(); // ネストされた配列を平坦化

  res.status(200).json({ marketPrice });
}
