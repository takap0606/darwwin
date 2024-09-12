import { useTheme } from '@mui/material';

export const generateAreaChartConfig = (chartDate: string[]) => {
  const theme = useTheme();
  return {
    chart: {
      height: 350,
      type: 'area',
      background: 'transparent',
      toolbar: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      sparkline: {
        enabled: false,
      },
      zoom: {
        enabled: false,
      },
    },
    xaxis: {
      type: 'datetime',
      categories: chartDate,
      labels: {
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM'yy",
          day: 'MM/dd',
          hour: 'HH:mm',
        },
      },
    },
    stroke: {
      colors: ['#8C7CF0'],
      width: 3,
    },
    grid: {
      padding: {
        right: 5,
        left: 5,
        bottom: 5,
      },
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy HH:mm',
      },
    },
    colors: [theme.colors.error.main],
  };
};
