// NFTデータを持ち、重複がないユーザーの配列を返す際に使用する関数
export const getUniqueUsersWithNfts = (usersArray: any, nftArray: any) => {
  const uniqueUsersMap = new Map();
  usersArray.forEach((user: any) => {
    const userNFTs = nftArray.filter(
      (nft: any) => nft.wallet_address === user.wallet_address,
    );
    const userWithNFTData = { ...user, nfts: userNFTs };
    uniqueUsersMap.set(user.wallet_address, userWithNFTData);
  });
  return Array.from(uniqueUsersMap.values());
};
