import React, { FC } from 'react';
import NftCard from 'features/dashboard/components/NftCard';

const NftList: FC<any> = ({ nftListData }) => {
  console.log(nftListData);
  return (
    <>
      {nftListData.map(
        (
          nft: {
            name: string;
            image_url: string;
            identifier: string;
            pricing: number;
            platform?: string;
            collection?: string;
          },
          index: number,
        ) => {
          const { name, image_url, identifier, pricing } = nft;
          return (
            <NftCard
              id={identifier}
              name={name}
              image={image_url}
              last_sale={pricing}
              key={index}
              platform={nft.platform}
              version={nft.collection}
            />
          );
        },
      )}
    </>
  );
};

export default NftList;
