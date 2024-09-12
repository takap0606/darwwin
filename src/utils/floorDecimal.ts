// 指定の小数点以下で切り捨て
const floorDecimal = (value: number, n: number) => {
  return Math.floor(value * Math.pow(10, n)) / Math.pow(10, n);
};

export default floorDecimal;
