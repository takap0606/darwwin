import {
  collection,
  endAt,
  getDocs,
  orderBy,
  query,
  startAt,
  where,
} from 'firebase/firestore';

// A-EシリーズのNFTを取得する際に使用する
export const getNFTsByMonth = async (
  db: any,
  seriesArray: string[],
  start: Date,
  end: Date,
) => {
  const nftsRef = collection(db, 'nfts');

  const seriesPromises = seriesArray.map((series) => {
    const q = query(
      nftsRef,
      where('series', '==', series),
      orderBy('created_at'),
      startAt(start),
      endAt(end),
    );
    return getDocs(q);
  });

  const allSeriesSnapshots = await Promise.all(seriesPromises);

  const allNfts = allSeriesSnapshots.reduce((acc: any, curr: any) => {
    curr.docs.forEach((doc: any) => acc.push(doc.data()));
    return acc;
  }, []);

  return allNfts;
};

// ユーザー一覧を取得する際に使用する
export const getUsers = async (db: any) => {
  const usersRef = collection(db, 'users');
  const allUsersSnapshot = await getDocs(usersRef);
  const allUsers = allUsersSnapshot.docs.map((doc) => doc.data());
  return allUsers;
};

// シリーズを指定してNFTを取得する際に使用する
export const getNftsFromSeries = async (db: any, series: string) => {
  const nftsRef = collection(db, 'nfts');
  const q = query(nftsRef, where('series', '==', series));
  const nftSnapshot = await getDocs(q);
  return nftSnapshot.docs.map((doc) => ({
    wallet_address: doc.data().owner_wallet_address,
    pa_dividend_rate: doc.data().pa_dividend_rate,
  }));
};

// ウォレットアドレス配列を指定してユーザーを取得する際に使用する
export const getUsersFromWalletAddresses = async (
  db: any,
  walletAddresses: string[],
) => {
  const usersRef = collection(db, 'users');
  const q2 = query(usersRef, where('wallet_address', 'in', walletAddresses));
  const usersSnapshot = await getDocs(q2);
  return usersSnapshot.docs.map((doc) => doc.data());
};
