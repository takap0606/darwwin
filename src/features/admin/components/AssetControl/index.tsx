import { Grid } from '@mui/material';
import AssetControlForm from 'features/admin/components/AssetControl/AssetControlForm';

const AssetControl = () => {
  return (
    <>
      <Grid
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
              <AssetControlForm />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default AssetControl;
