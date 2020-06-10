import TableChart, { ITableHeaders } from './TableChart';
import { select } from 'd3';
import { parse } from './__testhelper__';

describe('TableChart', () => {
  const mockRequestAnimationFrame = jest.fn((_cb: () => void) => {
    return 1; // dummy id to prevent rendering
  });
  global.requestAnimationFrame = mockRequestAnimationFrame as any;

  afterEach(() => {
    mockRequestAnimationFrame.mockClear();
  });

  test('empty', () => {
    const elem = new TableChart();
    expect(elem.rows).toEqual([]);
    expect(elem.headers).toEqual([]);
  });

  test('registered', () => {
    const elem = parse<TableChart>(`<table-chart></table-chart>`);
    expect(elem).toBeInstanceOf(TableChart);
  });

  test('attrs', () => {
    const elem = parse<TableChart>(
      `<table-chart top="2" batch="20" selected="3" sorted-column-index="2" sorted-column-order="asc"></table-chart>`
    );
    expect(elem).toBeInstanceOf(TableChart);
    expect(elem.top).toBe(2);
    expect(elem.batch).toBe(20);
    expect(elem.selected).toBe(3);
    expect(elem.sortedColumnIndex).toBe(2);
    expect(elem.sortedColumnOrder).toBe('asc');

    elem.top = 3;
    elem.batch = 10;
    elem.selected = 4;
    elem.sortedColumnIndex = 4;
    elem.sortedColumnOrder = 'desc';

    expect(elem.top).toBe(3);
    expect(elem.getAttribute('top')).toBe('3');
    expect(() => (elem.top = -2)).toThrowError();
    expect(elem.batch).toBe(10);
    expect(() => (elem.batch = -1)).toThrowError();
    expect(elem.getAttribute('batch')).toBe('10');
    expect(elem.selected).toBe(4);
    expect(() => (elem.selected = -2)).toThrowError();
    expect(elem.getAttribute('selected')).toBe('4');
    expect(elem.sortedColumnIndex).toBe(4);
    expect(() => (elem.sortedColumnIndex = -2)).toThrowError();
    expect(elem.getAttribute('sorted-column-index')).toBe('4');
    expect(elem.sortedColumnOrder).toBe('desc');
    expect(elem.getAttribute('sorted-column-order')).toBe('desc');

    mockRequestAnimationFrame.mockClear();
    elem.top = 3;
    expect(mockRequestAnimationFrame).not.toBeCalled();
    elem.setAttribute('top', '3');
    expect(mockRequestAnimationFrame).not.toBeCalled();
    elem.batch = 10;
    expect(mockRequestAnimationFrame).not.toBeCalled();
    elem.setAttribute('batch', '10');
    expect(mockRequestAnimationFrame).not.toBeCalled();
    elem.selected = 4;
    expect(mockRequestAnimationFrame).not.toBeCalled();
    elem.setAttribute('selected', '4');
    expect(mockRequestAnimationFrame).not.toBeCalled();
    elem.sortedColumnIndex = 4;
    expect(mockRequestAnimationFrame).not.toBeCalled();
    elem.setAttribute('sorted-column-index', '3');
    expect(mockRequestAnimationFrame).not.toBeCalled();
    elem.sortedColumnOrder = 'desc';
    expect(mockRequestAnimationFrame).not.toBeCalled();
    elem.setAttribute('sorted-column-order', 'desc');
    expect(mockRequestAnimationFrame).not.toBeCalled();
  });

  const testHeaders: ITableHeaders<{ d: string; v: number }> = [
    {
      type: 'string',
      attr: 'd',
      name: 'D',
      sortAble: true,
    },
    {
      type: 'number',
      attr: 'v',
      name: 'V',
      color: 'red',
      domain: [0, 3],
      sortAble: true,
    },
  ];
  const testRows = [
    { d: 'C', v: 1 },
    { d: 'B', v: 2 },
    { d: 'A', v: 2 },
  ];

  test('render', () => {
    const elem = new TableChart();
    elem.headers = testHeaders;
    elem.rows = testRows;
    elem.render();

    const root = select(elem.shadowRoot!);
    expect(root.selectAll('tbody > tr').size()).toBe(3);
    expect(root.select('tfoot > tr.hidden').empty()).toBeTruthy();
  });

  test('select', () => {
    const elem = new TableChart();
    elem.headers = testHeaders;
    elem.rows = testRows;
    elem.render();
    const mock = jest.fn();
    elem.addEventListener('select', mock);
    const root = select(elem.shadowRoot!);
    const row = root.select<HTMLTableRowElement>('tbody > tr');
    row.node()!.dispatchEvent(new MouseEvent('click'));
    expect(mock).toHaveBeenCalled();
    elem.render();
    expect(row.classed('selected')).toBeTruthy();
    expect(elem.selected).toBe(0);
    row.node()!.dispatchEvent(new MouseEvent('click'));
    expect(mock).toHaveBeenCalledTimes(2);
    elem.render();
    expect(row.classed('selected')).toBeFalsy();
    expect(elem.selected).toBe(-1);

    elem.selected = 0;
    elem.render();
    expect(row.classed('selected')).toBeTruthy();
  });

  test('sorting', () => {
    const elem = new TableChart();
    elem.headers = testHeaders;
    elem.rows = testRows;
    elem.sortedColumnIndex = 0;
    elem.sortedColumnOrder = 'asc';
    elem.render();

    const mock = jest.fn();
    elem.addEventListener('sort', mock);
    const root = select(elem.shadowRoot!);
    const row = root.select<HTMLTableRowElement>('tbody > tr');
    const rowHeader = root.select<HTMLTableCellElement>('thead th');
    expect(row.select('td').text()).toBe('A');

    rowHeader.node()!.dispatchEvent(new MouseEvent('click'));
    expect(mock).toHaveBeenCalled();
    elem.render();
    expect(row.select('td').text()).toBe('C');

    elem.sortedColumnOrder = 'asc';
    elem.render();
    expect(row.select('td').text()).toBe('A');
  });

  test('numeric sorting', () => {
    const elem = new TableChart();
    elem.headers = testHeaders;
    elem.rows = testRows;
    elem.sortedColumnIndex = 0;
    elem.sortedColumnOrder = 'asc';
    elem.render();

    const mock = jest.fn();
    elem.addEventListener('sort', mock);
    const root = select(elem.shadowRoot!);
    const row = root.select<HTMLTableRowElement>('tbody > tr');
    const numericHeader = root.select<HTMLTableCellElement>('thead th:nth-of-type(2)');
    expect(row.select('td').text()).toBe('A');

    numericHeader.node()!.dispatchEvent(new MouseEvent('click'));
    expect(mock).toHaveBeenCalled();
    elem.render();
    expect(row.select('td').text()).toBe('B');

    elem.sortedColumnOrder = 'asc';
    elem.render();
    expect(row.select('td').text()).toBe('C');
  });

  test('more', () => {
    const elem = new TableChart();
    elem.headers = testHeaders;
    elem.rows = testRows;
    elem.top = 1;
    elem.batch = 1;
    elem.render();

    const root = select(elem.shadowRoot!);
    expect(root.selectAll('tbody > tr').size()).toBe(1);
    // press more button
    root.select<HTMLButtonElement>('tfoot button').node()!.dispatchEvent(new MouseEvent('click'));
    elem.render();
    expect(root.selectAll('tbody > tr').size()).toBe(2);

    root.select<HTMLButtonElement>('tfoot button').node()!.dispatchEvent(new MouseEvent('click'));
    elem.render();

    expect(root.selectAll('tbody > tr').size()).toBe(3);
    expect(root.selectAll('tfoot td').classed('hidden')).toBeTruthy();
  });
});
