export const getPartnerNFTInfo = (name: string) => {
  const regex = /#(\d+)$/i;
  const match = name.match(regex);
  if (match && Number(match[1]) >= 10021 && Number(match[1]) <= 10040) {
    const partnerNFTInfo = {
      isPartnerNFT: true,
      purchaseAmount: '',
      dividendRate: '',
    };
    switch (Number(match[1])) {
      case 10038:
        partnerNFTInfo.purchaseAmount = '500';
        partnerNFTInfo.dividendRate = '0.16666';
        break;
      case 10026:
        partnerNFTInfo.purchaseAmount = '30';
        partnerNFTInfo.dividendRate = '0.01';
        break;
      case 10023:
        partnerNFTInfo.purchaseAmount = '270';
        partnerNFTInfo.dividendRate = '0.09';
        break;
      case 10035:
        partnerNFTInfo.purchaseAmount = '30';
        partnerNFTInfo.dividendRate = '0.01';
        break;
      case 10040:
        partnerNFTInfo.purchaseAmount = '300';
        partnerNFTInfo.dividendRate = '0.1';
        break;
      case 10032:
        partnerNFTInfo.purchaseAmount = '150';
        partnerNFTInfo.dividendRate = '0.05';
        break;
      case 10021:
        partnerNFTInfo.purchaseAmount = '150';
        partnerNFTInfo.dividendRate = '0.05';
        break;
      case 10033:
        partnerNFTInfo.purchaseAmount = '120';
        partnerNFTInfo.dividendRate = '0.04';
        break;
      case 10025:
        partnerNFTInfo.purchaseAmount = '30';
        partnerNFTInfo.dividendRate = '0.01';
        break;
      case 10034:
        partnerNFTInfo.purchaseAmount = '500';
        partnerNFTInfo.dividendRate = '0.16666';
        break;
      case 10028:
        partnerNFTInfo.purchaseAmount = '100';
        partnerNFTInfo.dividendRate = '0.03333';
        break;
      case 10036:
        partnerNFTInfo.purchaseAmount = '240';
        partnerNFTInfo.dividendRate = '0.08';
        break;
      case 10037:
        partnerNFTInfo.purchaseAmount = '50';
        partnerNFTInfo.dividendRate = '0.01666';
        break;
      case 10029:
        partnerNFTInfo.purchaseAmount = '90';
        partnerNFTInfo.dividendRate = '0.03';
        break;
      case 10031:
        partnerNFTInfo.purchaseAmount = '50';
        partnerNFTInfo.dividendRate = '0.01666';
        break;
      case 10039:
        partnerNFTInfo.purchaseAmount = '30';
        partnerNFTInfo.dividendRate = '0.01';
        break;
      case 10027:
        partnerNFTInfo.purchaseAmount = '30';
        partnerNFTInfo.dividendRate = '0.01';
        break;
      default:
        partnerNFTInfo.isPartnerNFT = false;
        break;
    }
    return partnerNFTInfo;
  }
  return { isPartnerNFT: false };
};
