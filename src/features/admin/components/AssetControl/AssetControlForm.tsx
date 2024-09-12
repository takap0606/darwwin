import { useState } from 'react';
import { Box, Grid, Card, useTheme, Typography } from '@mui/material';
import AssetControlFormBySeries from 'features/admin/components/AssetControl/AssetControlFormBySeries';

const AssetControlForm = () => {
  const theme = useTheme();
  const [currentSeries, setCurrentSeries] = useState('A');

  const handleSetSeries = (series: string) => {
    setCurrentSeries(series);
  };

  return (
    <>
      <Grid
        sx={{
          px: 4,
        }}
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={4}
      >
        <Grid item md={3} xs={12}>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="stretch"
            spacing={4}
          >
            <Grid item xs={12} md={12}>
              <Card>
                <Box
                  alignItems="center"
                  sx={{
                    background: `${theme.colors.alpha.black[5]}`,
                  }}
                  p={2}
                >
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(
                    (series) => (
                      <Box
                        key={series}
                        sx={{
                          '&:hover': {
                            cursor: 'pointer',
                          },
                        }}
                        py={2}
                        onClick={() => handleSetSeries(series)}
                      >
                        <Typography variant="h4">Series {series}</Typography>
                      </Box>
                    ),
                  )}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item md={9} xs={12}>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="stretch"
            spacing={4}
          >
            <Grid item xs={12} md={12}>
              <AssetControlFormBySeries
                key={currentSeries}
                series={currentSeries}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default AssetControlForm;
