export const getSeriesAndLevel = (name: string) => {
  const numberPattern = /#(\d+)/;
  const match = name.match(numberPattern);

  if (!match) {
    console.log('No match found for number pattern');
    return null;
  }

  const number = parseInt(match[1], 10);

  const seriesRanges = [
    { min: 1, max: 4, level: 'omega', series: 'A' },
    { min: 5, max: 8, level: 'omega', series: 'B' },
    { min: 9, max: 12, level: 'omega', series: 'C' },
    { min: 13, max: 16, level: 'omega', series: 'D' },
    { min: 17, max: 20, level: 'omega', series: 'E' },
    { min: 21, max: 36, level: 'ro', series: 'A' },
    { min: 37, max: 52, level: 'ro', series: 'B' },
    { min: 53, max: 68, level: 'ro', series: 'C' },
    { min: 69, max: 84, level: 'ro', series: 'D' },
    { min: 85, max: 100, level: 'ro', series: 'E' },
    { min: 101, max: 120, level: 'mr', series: 'A' },
    { min: 121, max: 140, level: 'mr', series: 'B' },
    { min: 141, max: 160, level: 'mr', series: 'C' },
    { min: 161, max: 180, level: 'mr', series: 'D' },
    { min: 181, max: 200, level: 'mr', series: 'E' },
    { min: 201, max: 300, level: 'dr', series: 'A' },
    { min: 301, max: 400, level: 'dr', series: 'B' },
    { min: 401, max: 500, level: 'dr', series: 'C' },
    { min: 501, max: 600, level: 'dr', series: 'D' },
    { min: 601, max: 700, level: 'dr', series: 'E' },
    { min: 701, max: 780, level: 'sr', series: 'A' },
    { min: 781, max: 860, level: 'sr', series: 'B' },
    { min: 861, max: 940, level: 'sr', series: 'C' },
    { min: 941, max: 1020, level: 'sr', series: 'D' },
    { min: 1021, max: 1100, level: 'sr', series: 'E' },
    { min: 1101, max: 1600, level: 'r', series: 'A' },
    { min: 1601, max: 2100, level: 'r', series: 'B' },
    { min: 2101, max: 2600, level: 'r', series: 'C' },
    { min: 2601, max: 3100, level: 'r', series: 'D' },
    { min: 3101, max: 3600, level: 'r', series: 'E' },
    { min: 3601, max: 4380, level: 's', series: 'A' },
    { min: 4381, max: 5160, level: 's', series: 'B' },
    { min: 5161, max: 5940, level: 's', series: 'C' },
    { min: 5941, max: 6720, level: 's', series: 'D' },
    { min: 6721, max: 7500, level: 's', series: 'E' },
    { min: 7501, max: 8000, level: 'c', series: 'A' },
    { min: 8001, max: 8500, level: 'c', series: 'B' },
    { min: 8501, max: 9000, level: 'c', series: 'C' },
    { min: 9001, max: 9500, level: 'c', series: 'D' },
    { min: 9501, max: 10000, level: 'c', series: 'E' },
    { min: 10001, max: 10020, level: 'paa', series: 'Y' },
    { min: 10021, max: 10040, level: 'pa', series: 'X' },
  ];

  for (const range of seriesRanges) {
    if (number >= range.min && number <= range.max) {
      return { level: range.level, series: range.series };
    }
  }

  return null;
};
