import axios from 'axios';

const BASE_URL = 'https://api.paradise.exchange';

export const getParadisePrice = async (symbol: string) => {
  const endpoint = `/spot/api/v3.2/price?symbol=${symbol}-USD`;
  try {
    const res = await axios.get(`${BASE_URL}${endpoint}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching ${symbol} price from Paradise:`, error);
    return null;
  }
};
