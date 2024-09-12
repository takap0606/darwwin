type SetRateType =
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '12'
  | '13'
  | '14'
  | '15'
  | '20'
  | string;

export const limitMap: { [key in SetRateType]: number } = {
  '5': 15000,
  '6': 50000,
  '7': 150000,
  '8': 250000,
  '9': 400000,
  '12': 1200000,
  '13': 2000000,
  '14': 4000000,
  '15': 4000000,
  '20': 4000000,
};

export const rateMap = [
  { volume: 10000000, point: 100, rate: 0.15 },
  { volume: 5000000, point: 50, rate: 0.14 },
  { volume: 3000000, point: 30, rate: 0.13 },
  { volume: 1000000, point: 10, rate: 0.12 },
  { volume: 500000, point: 5, rate: 0.09 },
  { volume: 300000, point: 3, rate: 0.08 },
  { volume: 100000, point: 2, rate: 0.07 },
  { volume: 30000, point: 1, rate: 0.06 },
  { volume: 0, point: 1, rate: 0.05 },
];
