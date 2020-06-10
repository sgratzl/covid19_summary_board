import { ISummaryData, IStatisticEntry, ICountryData } from './interfaces';
import { ITableHeaders, IPieChartData } from '../components';
import { schemeAccent } from 'd3';

export * from './interfaces';

export function fetchData(): Promise<Readonly<ISummaryData>> {
  return fetch('https://api.covid19api.com/summary', {
    cache: process.env.PRODUCTION ? undefined : 'force-cache',
  }).then((r) => r.json());
}

const colors = {
  active: schemeAccent[2],
  deaths: schemeAccent[4],
  recovered: schemeAccent[0],
};

export function generateTableHeaders(data: ISummaryData): ITableHeaders<ICountryData> {
  const max = data.Countries.reduce((acc, d) => Math.max(acc, d.TotalConfirmed), 0);
  return [
    {
      name: 'Country',
      attr: 'Country',
      type: 'string',
      sortAble: true,
    },
    {
      name: 'Total Confirmed',
      attr: 'TotalConfirmed',
      color: '#e6e6e6',
      type: 'number',
      sortAble: true,
      domain: [0, max],
    },
    {
      name: 'Total Active Cases',
      attr: (d) => d.TotalConfirmed - d.TotalDeaths - d.TotalRecovered,
      color: colors.active,
      type: 'number',
      sortAble: true,
      domain: [0, max],
    },
    {
      name: 'Total Deaths',
      attr: 'TotalDeaths',
      color: colors.deaths,
      type: 'number',
      sortAble: true,
      domain: [0, max],
    },
    {
      name: 'Total Recovered',
      attr: 'TotalRecovered',
      color: colors.recovered,
      type: 'number',
      sortAble: true,
      domain: [0, max],
    },
  ];
}

export function preparePieData(data: Readonly<IStatisticEntry>): IPieChartData {
  return [
    {
      name: 'Total Active Cases',
      value: data.TotalConfirmed - data.TotalDeaths - data.TotalRecovered,
      color: colors.active,
    },
    {
      name: 'Total Deaths',
      value: data.TotalDeaths,
      color: colors.deaths,
    },
    {
      name: 'Total Recovered',
      value: data.TotalRecovered,
      color: colors.recovered,
    },
  ];
}
