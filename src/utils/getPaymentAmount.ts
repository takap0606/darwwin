import { PAYMENT_FEE_PERCENTAGE } from 'constants/PAYMENT_FEE_PERCENTAGE';

export const getPaymentAmount = (amount: number) => {
  return Number(amount * PAYMENT_FEE_PERCENTAGE).toFixed(3);
};
