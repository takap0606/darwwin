// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { RestClientV5 } from 'bybit-api';
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const getUrl = (serviceType: string, endpoint: any) =>
  `https://api.paradise.exchange/${serviceType}${endpoint}`;
const getSpotUrl = (endpoint: string) => getUrl('spot', endpoint);

const API_KEY = process.env.BYBIT_API_KEY;
const API_SECRET = process.env.BYBIT_API_SECRET;

// Bybit APIクライアントの初期化
const bybitClient = new RestClientV5({
  testnet: false, // 本番環境を使用
  key: API_KEY,
  secret: API_SECRET,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
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
    'POL',
    'SAND',
    'LTC',
    'TRX',
    'LINK',
    'DOGE',
    'XMR',
    'ICP',
    'PEPE',
    'SUI',
    'NEAR',
    'GALA',
    'APT',
    'FET',
  ];

  const getMarketPrice = async (symbol: string) => {
    if (symbol === 'PDT' || symbol === 'XMR') {
      // Paradise Exchangeからの価格取得
      const endpoint = `/api/v3.2/price?symbol=${symbol}-USD`;
      try {
        const res = await axios.get(getSpotUrl(endpoint));
        return res.data;
      } catch (error) {
        console.error(`Error fetching ${symbol} price:`, error);
        return null;
      }
    } else {
      // Bybit APIを使用した価格取得
      try {
        const response = await bybitClient.getTickers({
          category: 'spot',
          symbol: `${symbol}USDT`,
        });

        if (response.retCode !== 0) {
          console.error(`Bybit API error for ${symbol}:`, response);
          return null;
        }

        return {
          symbol: `${symbol}-USD`,
          indexPrice: response.result.list[0].lastPrice,
          timestamp: new Date().getTime(),
        };
      } catch (error) {
        console.error(`Error fetching ${symbol} price from Bybit:`, error);
        return null;
      }
    }
  };

  try {
    const marketPrices = await Promise.all(symbols.map(getMarketPrice));
    const marketPrice = marketPrices.filter((price) => price !== null);
    res.status(200).json({ marketPrice });
  } catch (error) {
    console.error('Error processing market prices:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
