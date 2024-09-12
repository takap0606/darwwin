export const fetchTokenPrice = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/getTokenPrice`,
  );

  const data = await res.json();
  const tokenPrice: Object = {
    data,
  };

  return tokenPrice;
};
