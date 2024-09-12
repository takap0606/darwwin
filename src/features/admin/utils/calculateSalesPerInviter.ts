export const calculateSalesPerInviter = (inviterData: Map<string, any>) => {
  const inviterSalesMap = new Map();
  inviterData.forEach((referredUsers, inviterWallet) => {
    let totalSales = 0;
    referredUsers.forEach((user: any) => {
      const userSales = user.nfts.reduce(
        (acc: any, nft: any) => acc + Number(nft.last_sale_eth_price),
        0,
      );
      totalSales += userSales;
    });
    inviterSalesMap.set(inviterWallet, totalSales);
  });
  return inviterSalesMap;
};
