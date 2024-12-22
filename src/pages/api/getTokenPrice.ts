// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios';

const getUrl = (serviceType: string, endpoint: any) =>
  `https://api.paradise.exchange/${serviceType}${endpoint}`;
const getSpotUrl = (endpoint: string) => getUrl('spot', endpoint);
const getBybitUrl = (endpoint: string) =>
  `https://api.bytick.com/v5${endpoint}`;

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
    'POL', // MATICからPOLに変更
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
  ].map((symbol) => `${symbol}-USD`);

  const getMarketPrice = async (symbol: string) => {
    if (symbol === 'PDT-USD' || symbol === 'XMR-USD') {
      // Paradise Exchangeからの価格取得
      const endpoint = `/api/v3.2/price?symbol=${symbol}`;
      try {
        const res = await axios.get(getSpotUrl(endpoint));
        return res.data;
      } catch (error) {
        console.error(`Error fetching PDT price:`, error);
        return null;
      }
    } else {
      // Bybitからの価格取得（本番環境）
      const bybitSymbol = `${symbol.replace('-USD', '')}USDT`;
      const endpoint = `/market/tickers?category=spot&symbol=${bybitSymbol}`;
      try {
        const res = await axios.get(getBybitUrl(endpoint), {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'cdn-request-id': `${Date.now()}-${bybitSymbol}`, // リクエストの追跡用
          },
          timeout: 5000,
        });
        if (res.data.retCode !== 0) {
          // Bybitの正常レスポンスコードは0
          console.error(`Bybit API error for ${symbol}:`, res.data);
          return null;
        }
        return {
          symbol: symbol,
          indexPrice: res.data.result.list[0].lastPrice,
          timestamp: new Date().getTime(),
        };
      } catch (error) {
        console.error(`Error fetching ${symbol} price from Bybit:`, error);
        return null;
      }
    }
  };

  const marketPrices = await Promise.all(symbols.map(getMarketPrice));
  const marketPrice = marketPrices.flat(); // ネストされた配列を平坦化

  res.status(200).json({ marketPrice });
}
