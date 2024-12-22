import { RestClientV5 } from 'bybit-api';

const API_KEY = process.env.BYBIT_API_KEY;
const API_SECRET = process.env.BYBIT_API_SECRET;

const bybitClient = new RestClientV5({
  testnet: false,
  key: API_KEY,
  secret: API_SECRET,
});

export const getBybitPrice = async (symbol: string) => {
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
};
