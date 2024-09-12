import { Grid, useTheme } from '@mui/material';
import AffiliateRecordList from 'features/admin/components/AffiliateRecord/AffiliateRecordList';

function AffiliateRecord() {
  const theme = useTheme();

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
        <Grid item md={12} xs={12}>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="stretch"
            spacing={4}
          >
            <Grid item xs={12} md={12}>
              <AffiliateRecordList />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default AffiliateRecord;
