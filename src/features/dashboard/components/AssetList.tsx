import React from 'react';
import { Box } from '@mui/material';
import AssetCard from 'features/dashboard/components/AssetCard';

const AssetList = ({ listData, tokens, isLoading, setIsLoading }: any) => {
  return (
    <>
      {listData.map((data: any) => (
        <Box key={data.id} mb={2}>
          <AssetCard
            data={data}
            tokens={tokens}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </Box>
      ))}
    </>
  );
};

export default AssetList;
