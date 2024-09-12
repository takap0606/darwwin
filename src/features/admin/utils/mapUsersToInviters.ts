export const mapUsersToInviters = (allNfts: any[], allUsers: any[]) => {
  const referredUsersMap = new Map();
  allUsers.forEach((user) => {
    const userNFTs = allNfts.filter(
      (nft: any) => nft.owner_wallet_address === user.wallet_address,
    );
    if (userNFTs.length > 0) {
      const updatedUser = { ...user, nfts: userNFTs };

      const inviter = allUsers.find(
        (inviter) => inviter.invitation_code === user.invited_code,
      );

      if (inviter) {
        const referredUsers =
          referredUsersMap.get(inviter.wallet_address) || [];
        referredUsers.push(updatedUser);
        referredUsersMap.set(inviter.wallet_address, referredUsers);
      }
    }
  });
  return referredUsersMap;
};
