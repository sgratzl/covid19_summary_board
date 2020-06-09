import { ISummaryData, IStatisticEntry } from './interfaces';
import { IPieChartData } from '../components/index';

export * from './interfaces';

export function fetchData(): Promise<Readonly<ISummaryData>> {
  return fetch('https://api.covid19api.com/summary', {
    cache: 'force-cache',
  }).then((r) => r.json());
}

export function preparePieData(data: Readonly<IStatisticEntry>): IPieChartData {
  // TODO better colors
  return [
    {
      name: 'Total Deaths',
      value: data.TotalDeaths,
      color: 'black',
    },
    {
      name: 'Total Active',
      value: data.TotalConfirmed - data.TotalDeaths - data.TotalRecovered,
      color: 'red',
    },
    {
      name: 'Total Recovered',
      value: data.TotalRecovered,
      color: 'green',
    },
  ];
}
