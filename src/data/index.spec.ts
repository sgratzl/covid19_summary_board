import { preparePieData, generateTableHeaders, fetchData } from '.';
import dump from './__testhelper__/dump';
import { INumberTableHeader } from '../components';
import { IStatisticEntry } from './interfaces';
import { accessor } from '../components/utils';

describe('preparePieData', () => {
  test('default', () => {
    const data = preparePieData({
      NewConfirmed: 100,
      NewDeaths: 1,
      NewRecovered: 10,
      TotalConfirmed: 100,
      TotalDeaths: 10,
      TotalRecovered: 10,
    });
    expect(data).toHaveLength(3);
    expect(data[0].name).toBe('Total Active Cases');
    expect(data[0].value).toBe(100 - 10 - 10);
    expect(data[1].name).toBe('Total Deaths');
    expect(data[1].value).toBe(10);
    expect(data[2].name).toBe('Total Recovered');
    expect(data[2].value).toBe(10);
  });
});

describe('generateTableHeaders', () => {
  test('default', () => {
    const data = generateTableHeaders(dump);
    const firstCountry = dump.Countries[0]!;
    expect(data).toHaveLength(5);
    expect(data[0].type).toBe('string');
    expect(data[0].name).toBe('Country');
    expect(accessor(firstCountry, data[0].attr)).toBe(firstCountry.Country);

    expect(data[1].type).toBe('number');
    expect(data[1].name).toBe('Total Confirmed');
    expect(accessor(firstCountry, data[1].attr)).toBe(firstCountry.TotalConfirmed);
    expect(data[1].type).toBe('number');

    expect(data[2].name).toBe('Total Active Cases');
    expect(accessor(firstCountry, data[2].attr)).toBe(
      firstCountry.TotalConfirmed - firstCountry.TotalDeaths - firstCountry.TotalRecovered
    );
    expect(data[2].type).toBe('number');

    expect(data[3].name).toBe('Total Deaths');
    expect(accessor(firstCountry, data[3].attr)).toBe(firstCountry.TotalDeaths);
    expect(data[3].type).toBe('number');

    expect(data[4].name).toBe('Total Recovered');
    expect(accessor(firstCountry, data[4].attr)).toBe(firstCountry.TotalRecovered);
    expect(data[4].type).toBe('number');

    // check domains
    const max = dump.Countries.reduce((acc, d) => Math.max(acc, d.TotalConfirmed), 0);
    expect((data[1] as INumberTableHeader<IStatisticEntry>).domain).toEqual([0, max]);
    expect((data[2] as INumberTableHeader<IStatisticEntry>).domain).toEqual([0, max]);
    expect((data[3] as INumberTableHeader<IStatisticEntry>).domain).toEqual([0, max]);
    expect((data[4] as INumberTableHeader<IStatisticEntry>).domain).toEqual([0, max]);
  });
});

describe('fetchData', () => {
  const fetchMock = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(dump),
    })
  );
  global.fetch = fetchMock as any;
  afterEach(() => {
    fetchMock.mockClear();
  });
  test('returns mock', () => {
    return expect(fetchData()).resolves.toEqual(dump);
  });
  test('returns error', async () => {
    fetchMock.mockImplementationOnce(() => Promise.reject('down'));
    return expect(fetchData()).rejects.toEqual('down');
  });
});
