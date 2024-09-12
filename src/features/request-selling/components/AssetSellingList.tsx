import React, { memo, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import AssetSellingCard from 'features/request-selling/components/AssetSellingCard';

const AssetSellingList = ({
  listData,
  sellingFeeRate,
  tokens,
  isLoading,
  setIsLoading,
}: any) => {
  return (
    <>
      {listData.map((data: any) => (
        <Box key={data.id} mb={2}>
          <AssetSellingCard
            data={data}
            tokens={tokens}
            sellingFeeRate={sellingFeeRate}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </Box>
      ))}
    </>
  );
};

export default memo(AssetSellingList);
