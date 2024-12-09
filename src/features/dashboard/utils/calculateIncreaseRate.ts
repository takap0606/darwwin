// 価格の変化率を計算する関数
export const calculateIncreaseRate = (currentPrice: any, lastPrice: any) => {
  // current_asset_price が 0 の場合は 0% を返す
  if (Number(currentPrice) === 0) {
    return '0.00';
  }

  const rate = (
    ((Number(currentPrice) - Number(lastPrice)) / Number(lastPrice)) *
    100
  ).toFixed(2);

  // プラスの場合は「+」記号を追加
  return Number(rate) > 0 ? `+${rate}` : rate;
};
