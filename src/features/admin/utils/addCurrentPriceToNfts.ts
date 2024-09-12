import { SERIES_ASSETS } from 'constants/SERIES_ASSETS';
import { AssetCardData } from 'features/dashboard/types';
import { createPortfolio } from 'utils/createPortfolio';
import createPortfolioForUltra from 'utils/createPortfolioForUltra';

type TokenAmounts = Record<string, number>;

// NFTの現在価格を計算する関数
export const addCurrentPriceToNfts = (
  nft: any[] | AssetCardData,
  currentTokenPrices: Record<string, number>,
) => {
  const {
    id,
    name,
    image,
    last_sale_eth_price,
    last_sale_usd_price,
    created_at,
    series,
    level,
    records,
    ...sets
  } = nft as AssetCardData & {
    records: any[];
    [key: string]: number | string | any[];
  };

  let newTotalGrowth = 0;

  // tokenAmountsの初期値をsetsから取得
  const initialTokenKeys = Object.keys(sets).filter((key) =>
    key.startsWith('set_'),
  );

  const tokenAmounts: TokenAmounts = initialTokenKeys.reduce((acc, key) => {
    const tokenKey = key.slice(4);
    acc[tokenKey] = Number(sets[key]);
    return acc;
  }, {} as TokenAmounts);

  records.forEach((doc: any) => {
    newTotalGrowth += Number(doc.weekly_p_growth);

    // term1は計算に入れないための処理
    if (doc.term === '1') return;

    for (const token of Object.keys(doc)) {
      if (
        token !== 'weekly_p_growth' &&
        token !== 'series' &&
        token !== 'target' &&
        token !== 'created_at'
      ) {
        const tokenKey = token;
        tokenAmounts[tokenKey] += tokenAmounts[tokenKey] * doc[token];
      }
    }
  });

  // シリーズを引数にポートフォリオを作成する
  const selectedPortfolio =
    series !== 'Ultra'
      ? createPortfolio(series)
      : createPortfolioForUltra(tokenAmounts);

  // 各トークンの現在価格を計算する
  const calculateCurrentPrice = (amount: number, price: number) =>
    (amount * Number(price)).toFixed(4);

  const currentPrices = Object.entries(currentTokenPrices).reduce(
    (acc, [key, price]) => {
      const tokenKey = key.slice(0, -5).toLowerCase();
      if (tokenAmounts[tokenKey]) {
        acc[tokenKey] = calculateCurrentPrice(tokenAmounts[tokenKey], price);
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  const current_asset_price =
    series === 'Ultra'
      ? selectedPortfolio
          .reduce(
            (sum: number, assetInfo: any) =>
              sum +
              Number(currentPrices[assetInfo.tokenName.toLowerCase()] || 0),
            0,
          )
          .toFixed(0)
      : SERIES_ASSETS[series]
      ? SERIES_ASSETS[series]
          .reduce(
            (sum: number, asset: string | number) =>
              sum + Number(currentPrices[asset] || 0),
            0,
          )
          .toFixed(0)
      : '0';

  return { current_asset_price, tokenAmounts, newTotalGrowth };
};
