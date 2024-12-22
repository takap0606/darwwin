import { PAYMENT_FEE_PERCENTAGE } from 'constants/PAYMENT_FEE_PERCENTAGE';
import { getDecimalPlacesByTokenName } from 'utils/getDecimalPlacesByTokenName';

type CalculatedToken = {
  tokenName: string;
  profit: string;
  fee: string;
  currentAmount: string;
  currentAmountWithoutFee: string;
  paymentAmount: string;
};

export const calculateTokens = (
  current_asset_price: string | number,
  last_sale_usd_price: string,
  tokens: Record<string, number>,
  tokenAmounts: Record<string, number>,
  sellingFeeRate: number,
  tokenAmountsArray: number[],
): CalculatedToken[] => {
  // ①利益 = 現在価格 - セット時価格
  const profitInUsd = (
    Number(current_asset_price) - Number(last_sale_usd_price)
  ).toFixed(0);

  // 利益がプラスの場合は
  // ②1銘柄の利益 = 利益 / 銘柄数
  const profitInUsdPerToken = Number(profitInUsd) / tokenAmountsArray.length;

  const calculatedTokens = Object.entries(tokens).reduce(
    (acc, [key, price]) => {
      const tokenKey = key.slice(0, -5).toLowerCase();
      if (tokenAmounts[tokenKey]) {
        const decimalPlace = getDecimalPlacesByTokenName(
          tokenKey.toLocaleUpperCase(),
        );
        // ③各銘柄の利益 = 1銘柄の利益 / 現在の銘柄の価格
        const profit =
          Number(profitInUsd) > 0
            ? (profitInUsdPerToken / Number(price)).toFixed(
                Number(decimalPlace),
              )
            : '0';

        // ④各銘柄の手数料 = 各銘柄の利益 * 手数料率（ユーザーに応じて20-30%)
        const fee =
          Number(profitInUsd) > 0
            ? (Number(profit) * sellingFeeRate).toFixed(Number(decimalPlace))
            : '0';
        const currentAmount = tokenAmounts[tokenKey].toFixed(
          Number(decimalPlace),
        );

        // ⑤各銘柄の手数料を差し引いた金額 = 各銘柄の現在の枚数（recordを含めた）- 各銘柄の手数料
        const currentAmountWithoutFee = (
          Number(currentAmount) - Number(fee)
        ).toFixed(Number(decimalPlace));

        // ⑥支払い枚数 = 各銘柄の手数料を差し引いた金額 * 支払い手数料率（5%)
        const paymentAmount = Number(currentAmountWithoutFee)
          //  DARWWINではここでPAYMENT_FEE_PERCENTAGEをかけない
          // * PAYMENT_FEE_PERCENTAGE
          .toFixed(Number(decimalPlace));

        acc.push({
          tokenName: tokenKey,
          profit: profit,
          fee: fee,
          currentAmount: currentAmount.toString(),
          currentAmountWithoutFee: currentAmountWithoutFee,
          paymentAmount: paymentAmount,
        });
      }
      return acc;
    },
    [] as CalculatedToken[],
  );

  return calculatedTokens;
};
