export type AssetCardData = {
  id: string;
  name: string;
  image: string;
  last_sale_eth_price: string;
  last_sale_usd_price: string;
  created_at: string;
  series: string;
  level: string;
  [key: string]: number | string;
} & {
  set_btc: number;
  set_eth: number;
  set_xrp: number;
  set_atom: number;
  set_pdt: number;
  set_sol: number;
  set_bnb: number;
  set_ada: number;
  set_dot: number;
  set_fil: number;
  set_avax: number;
  set_matic: number;
  set_sand: number;
  set_ltc: number;
  set_trx: number;
  set_link: number;
  set_doge: number;
  set_xmr: number;
  set_pepe: number;
  set_sui: number;
  set_near: number;
  set_gala: number;
  set_apt: number;
  set_fet: number;
};

export interface AssetCardProps {
  data: AssetCardData;
  tokens: Record<string, number>;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export interface SellingCardProps {
  data: AssetCardData;
  tokens: Record<string, number>;
  sellingFeeRate: number;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}
