import { ISummaryData, IStatisticEntry, ICountyData } from './interfaces';
import { ITableHeaders, IPieChartData } from '../components/index';

export * from './interfaces';

export function fetchData(): Promise<Readonly<ISummaryData>> {
  return fetch('https://api.covid19api.com/summary', {
    cache: 'force-cache',
  }).then((r) => r.json());
}

export const tableHeaders: ITableHeaders<ICountyData> = [
  {
    name: 'Country',
    attr: 'Country',
    color: null,
    type: 'string',
  },
  {
    name: 'Total Confirmed',
    attr: 'TotalConfirmed',
    color: null,
    type: 'number',
  },
  {
    name: 'Total Active',
    attr: (d) => d.TotalConfirmed - d.TotalDeaths - d.TotalRecovered,
    color: 'red',
    type: 'number',
  },
  {
    name: 'Total Deaths',
    attr: 'TotalDeaths',
    color: 'black',
    type: 'number',
  },
  {
    name: 'Total Recovered',
    attr: 'TotalRecovered',
    color: 'green',
    type: 'number',
  },
];

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
