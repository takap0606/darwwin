import { Box, Container, Grid, Typography, styled } from '@mui/material';

const TypographyH2 = styled(Typography)(
  ({ theme }) => `
    font-size: ${theme.typography.pxToRem(17)};
`,
);

const ImgWrapper = styled(Box)(
  ({ theme }) => `
    position: relative;
    z-index: 5;
    width: 100%;
    overflow: hidden;
    border-radius: ${theme.general.borderRadiusLg};
    box-shadow: 0 0rem 14rem 0 rgb(255 255 255 / 20%), 0 0.8rem 2.3rem rgb(111 130 156 / 3%), 0 0.2rem 0.7rem rgb(17 29 57 / 15%);

    img {
      display: block;
      width: 100%;
    }
  `,
);

const BoxAccent = styled(Box)(
  ({ theme }) => `
    border-radius: ${theme.general.borderRadiusLg};
    background: ${theme.palette.background.default};
    width: 100%;
    height: 100%;
    position: absolute;
    left: -40px;
    bottom: -40px;
    display: block;
    z-index: 4;
  `,
);

const BoxContent = styled(Box)(
  () => `
  width: 150%;
  position: relative;
`,
);

const ListItemWrapper = styled(Box)(
  () => `
    display: flex;
    align-items: center;
`,
);

const NftImageAvatar = styled(Box)(
  ({ theme }) => `
    width: ${theme.spacing(8)};
    height: ${theme.spacing(8)};
    border-radius: ${theme.general.borderRadius};
    background-color: #fff;
    flex-shrink: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: ${theme.spacing(2)};

    img {
      width: 100%;
      height: 100%;
      display: block;
    }
`,
);

const HeroLogoImage = styled(Box)(
  () => `
    img {
      max-width: 100%;
      display: block;
    }
`,
);

function Hero() {
  return (
    <Container maxWidth="lg">
      <Grid
        spacing={{ xs: 6, md: 10 }}
        justifyContent="center"
        alignItems="center"
        container
      >
        <Grid item md={6} pr={{ xs: 0, md: 3 }}>
          <HeroLogoImage mb={2} pr={8} maxWidth="500px" display="block">
            <img src="/static/images/hero/hero_title.svg" alt="" />
          </HeroLogoImage>
          <TypographyH2
            sx={{
              lineHeight: 1.5,
              pb: 4,
            }}
            variant="h4"
            color="text.secondary"
            fontWeight="normal"
          >
            Welcome to CRYPTO TRUST! As a trailblazing Web3 company, we're
            excited to offer a distinctive platform for NFT staking, now
            enhanced with the capability to unlock the true value of NFTs. Our
            platform invites everyone to easily participate in NFT staking,
            tapping into the cryptocurrency market's growth potential. We focus
            on a select range of cryptocurrencies to foster portfolio expansion
            and asset growth. Designed for ease of use, our platform serves both
            beginners and experts, streamlining digital asset management. With
            advanced technology and a secure environment, we're opening new
            paths for digital asset expansion. Join CRYPTO TRUST to dive into
            the innovative realm of NFT staking. Here, you'll find a safe and
            efficient entry point into the cryptocurrency world and take part in
            the vanguard of the new era in digital asset growth, fully realizing
            the intrinsic value of NFTs. Start your journey with us today!
          </TypographyH2>
          <Typography fontSize="1.8rem" color="#fff" fontWeight="bold">
            LUPPY NFT ROADMAP
          </Typography>
          <ListItemWrapper sx={{ mt: 2, mb: 2 }}>
            <NftImageAvatar>
              <img src="/static/images/hero/roadmap1.jpg" alt="" />
            </NftImageAvatar>
            <Typography variant="h6">
              <b>STEP1 </b>
              <Typography component="span" variant="subtitle2">
                {' '}
                <br />
                - Launch of LUPPY collection
                <br />
                - Partnership with CRYPTO TRUST
                <br />
              </Typography>
            </Typography>
          </ListItemWrapper>
          <ListItemWrapper
            sx={{
              mb: 2,
            }}
          >
            <NftImageAvatar>
              <img src="/static/images/hero/roadmap2.jpg" alt="" />
            </NftImageAvatar>
            <Typography variant="h6">
              <b>STEP2 </b>
              <Typography component="span" variant="subtitle2">
                {' '}
                <br />
                - LAUNCH of MEDIA TO EARN
                <br />
                - WORLD TRADE academy launch
                <br />
              </Typography>
            </Typography>
          </ListItemWrapper>
          <ListItemWrapper
            sx={{
              mb: 2,
            }}
          >
            <NftImageAvatar>
              <img src="/static/images/hero/roadmap4.jpg" alt="" />
            </NftImageAvatar>
            <Typography variant="h6">
              <b>STEP3 </b>
              <Typography component="span" variant="subtitle2">
                {' '}
                <br />
                - Metaverse
                <br />- LUPPY Figure Collection
              </Typography>
            </Typography>
          </ListItemWrapper>
          <ListItemWrapper
            sx={{
              mb: 2,
            }}
          >
            <NftImageAvatar>
              <img src="/static/images/hero/roadmap3.jpg" alt="" />
            </NftImageAvatar>
            <Typography variant="h6">
              <b>STEP4 </b>
              <Typography component="span" variant="subtitle2">
                {' '}
                <br />
                - Collaboration with many brands
                <br />- Launch another project
              </Typography>
            </Typography>
          </ListItemWrapper>
        </Grid>
        <Grid item md={6}>
          <BoxContent>
            <Box>
              <ImgWrapper>
                <img src="/static/images/hero/frontend.svg" alt="" />
              </ImgWrapper>
            </Box>
            <BoxAccent
              sx={{
                display: { xs: 'none', md: 'block' },
              }}
            />
          </BoxContent>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Hero;
