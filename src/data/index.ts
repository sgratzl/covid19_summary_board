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
    sortAble: true,
  },
  {
    name: 'Total Confirmed',
    attr: 'TotalConfirmed',
    color: null,
    type: 'number',
    sortAble: true,
  },
  {
    name: 'Total Active Cases',
    attr: (d) => d.TotalConfirmed - d.TotalDeaths - d.TotalRecovered,
    color: 'red',
    type: 'number',
    sortAble: true,
  },
  {
    name: 'Total Deaths',
    attr: 'TotalDeaths',
    color: 'black',
    type: 'number',
    sortAble: true,
  },
  {
    name: 'Total Recovered',
    attr: 'TotalRecovered',
    color: 'green',
    type: 'number',
    sortAble: true,
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
      name: 'Total Active Cases',
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
