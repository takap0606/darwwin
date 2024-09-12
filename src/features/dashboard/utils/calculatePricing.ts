// OpenSea用の価格情報を計算する関数
export const calculateOpenSeaPricing = (
  last_sale: { payment: { quantity: number | null } },
  tokens: { ethPrice: number },
) => {
  let price = '0';
  let fixedPrice = '0';
  let usd_eth = '0';
  let usd_base_investment_amount = '0';
  let fixed_usd_base_investment_amount = '0';

  if (last_sale?.payment?.quantity != null) {
    price = (last_sale.payment.quantity * 1e-18).toString();
    fixedPrice = Number(price).toFixed(4).toString();
    usd_eth = (Number(price) * tokens.ethPrice).toString();
    // DARWWINではセット時に0.97*0.8を掛ける
    usd_base_investment_amount = (Number(usd_eth) * 0.97 * 0.8).toString();
    fixed_usd_base_investment_amount = Number(usd_base_investment_amount)
      .toFixed(0)
      .toString();
  }

  return {
    fixedPrice,
    fixed_usd_base_investment_amount,
  };
};

// X2Y2用の価格情報を計算する関数
export const calculateX2Y2Pricing = (
  last_sale: {
    price: { amount: { decimal: { toString: () => string }; usd: string } };
  } | null,
) => {
  let price = '0';
  let fixedPrice = '0';
  let usd_eth = '0';
  let usd_base_investment_amount = '0';
  let fixed_usd_base_investment_amount = '0';

  if (last_sale != null) {
    price = last_sale.price.amount.decimal.toString();
    fixedPrice = Number(price).toFixed(4).toString();
    usd_eth = last_sale.price.amount.usd;
    // DARWWINではセット時に0.97*0.8を掛ける
    usd_base_investment_amount = (Number(usd_eth) * 0.97 * 0.8).toString();
    fixed_usd_base_investment_amount = Number(usd_base_investment_amount)
      .toFixed(0)
      .toString();
  }

  return {
    fixedPrice,
    fixed_usd_base_investment_amount,
  };
};
