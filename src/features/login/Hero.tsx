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

const BybitLogo = styled(Box)(
  ({ theme }) => `
    width: ${theme.spacing(12)};
    height: ${theme.spacing(12)};
    flex-shrink: 0;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      display: block;
    }
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
            <img src="/static/images/hero/hero_title.png" alt="" />
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
            Welcome to DARWWIN, your gateway to the future of NFT staking and
            digital asset growth.
            <br /> At DARWWIN, we empower you to unlock the full potential of
            your NFTs by staking and growing your digital assets with ease. Our
            platform is designed to take advantage of the booming cryptocurrency
            market, helping you maximize your portfolio during the bull run.
            Whether you’re a beginner or an expert, our intuitive interface and
            robust security make it simple to manage your assets and track your
            progress in real time.
            <br /> Join DARWWIN today and experience a secure, innovative way to
            grow your NFT portfolio. With us, you’re not just investing in
            NFTs—you’re stepping into the next evolution of digital finance.
          </TypographyH2>
          <Typography variant="h2">Partnership</Typography>
          <ListItemWrapper>
            <BybitLogo>
              <img src="/static/images/hero/roadmap1.svg" alt="" />
            </BybitLogo>
          </ListItemWrapper>
        </Grid>
        <Grid item md={6}>
          <BoxContent>
            <Box>
              <ImgWrapper>
                <img src="/static/images/hero/frontend.png" alt="" />
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
