export interface IStatisticEntry {
  NewConfirmed: number;
  TotalConfirmed: number;
  NewDeaths: number;
  TotalDeaths: number;
  NewRecovered: number;
  TotalRecovered: number;
}

export interface ICountyData extends IStatisticEntry {
  Country: string;
  CountryCode: string;
  Slug: string;
  Data: string;
}

export interface ISummaryData {
  Global: Readonly<IStatisticEntry>;
  Countries: ReadonlyArray<Readonly<ICountyData>>;
}
