const sumTreeValues = (array = [], key: string) =>
  array.reduce(
    (total: number, object: any): any =>
      total + object[key] + sumTreeValues(object.children, key),
    0,
  );

export default sumTreeValues;
