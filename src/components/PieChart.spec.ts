import PieChart from './PieChart';
import { select } from 'd3';
import { parse } from './__testhelper__';

describe('PieChart', () => {
  const mockRequestAnimationFrame = jest.fn((_cb: () => void) => {
    return 1; // dummy id to prevent rendering
  });
  global.requestAnimationFrame = mockRequestAnimationFrame as any;

  afterEach(() => {
    mockRequestAnimationFrame.mockClear();
  });

  test('empty', () => {
    const elem = new PieChart();
    expect(elem.data).toEqual([]);
    expect(elem.legend).toBe(true);
  });

  test('registered', () => {
    const elem = parse<PieChart>(`<pie-chart></pie-chart>`);
    expect(elem).toBeInstanceOf(PieChart);
  });

  test('legend attr', () => {
    const elem = parse<PieChart>(`<pie-chart legend="false"></pie-chart>`);
    expect(elem).toBeInstanceOf(PieChart);
    expect(elem.data).toEqual([]);
    expect(elem.legend).toBe(false);

    elem.legend = true;
    expect(elem.legend).toBe(true);
    expect(elem.getAttribute('legend')).toBe('true');
  });

  test('animated attr', () => {
    const elem = parse<PieChart>(`<pie-chart animated="false"></pie-chart>`);
    expect(elem).toBeInstanceOf(PieChart);
    expect(elem.animated).toBe(false);

    elem.animated = true;
    expect(elem.animated).toBe(true);
    expect(elem.getAttribute('animated')).toBe('true');
  });

  test('legend changed to same no render', () => {
    const elem = new PieChart();
    expect(elem.legend).toBe(true);
    elem.legend = false;
    mockRequestAnimationFrame.mockClear();
    elem.legend = false;
    expect(mockRequestAnimationFrame).not.toBeCalled();
    elem.setAttribute('legend', 'false');
    expect(mockRequestAnimationFrame).not.toBeCalled();

    expect(elem.animated).toBe(true);
    elem.animated = true;
    expect(mockRequestAnimationFrame).not.toBeCalled();
    elem.setAttribute('animated', 'true');
    expect(mockRequestAnimationFrame).not.toBeCalled();
  });

  const testData = [
    {
      color: 'red',
      name: 'A',
      value: 3,
    },
    {
      color: 'blue',
      name: 'B',
      value: 2,
    },
  ];

  test('data attr', () => {
    const elem = parse<PieChart>(`<pie-chart data="${JSON.stringify([])}"></pie-chart>`);
    expect(elem).toBeInstanceOf(PieChart);
    expect(elem.data).toEqual([]);

    elem.data = testData;
    expect(elem.data).toEqual(testData);
  });

  test('render', () => {
    const elem = parse<PieChart>(`<pie-chart animated="false"></pie-chart>`);
    elem.data = testData;
    const root = select(elem.shadowRoot!);
    // not rendered yet
    expect(root.selectAll('svg > g > *').size()).toBe(0);
    // run the render
    elem.render();
    expect(root.selectAll('svg > g > *').size()).toBe(2);
    expect(root.select('path[data-count="2"]').empty()).toBeFalsy();
    expect(root.select('path[data-count="2"]').style('fill')).toBe('blue');
    expect(root.select('path[data-count="3"]').empty()).toBeFalsy();
    expect(root.select('path[data-count="3"]').style('fill')).toBe('red');

    expect(root.selectAll('.legend > *').size()).toBe(2);
    expect(root.select('.legend div[data-count="2"]').empty()).toBeFalsy();
    expect(root.select('.legend div[data-count="3"]').empty()).toBeFalsy();
  });

  test('render animated', () => {
    const elem = parse<PieChart>(`<pie-chart></pie-chart>`);
    elem.data = testData;
    const root = select(elem.shadowRoot!);
    expect(elem.animated).toBeTruthy();
    // not rendered yet
    expect(root.selectAll('svg > g > *').size()).toBe(0);
    // run the render
    elem.render();
    expect(root.selectAll('svg > g > *').size()).toBe(2);
  });

  test('no visible legend', () => {
    const elem = parse<PieChart>(`<pie-chart animated="false"></pie-chart>`);
    elem.data = testData;
    elem.legend = false;
    mockRequestAnimationFrame.mockImplementationOnce((cb: () => void) => {
      cb();
      return -1;
    });
    elem.render();
    const root = select(elem.shadowRoot!);
    expect(root.select('.legend').classed('hidden')).toBeTruthy();
  });

  test('hover changes path', () => {
    const elem = parse<PieChart>(`<pie-chart animated="false"></pie-chart>`);
    elem.data = testData;
    elem.legend = false;
    elem.render();
    const root = select(elem.shadowRoot!);
    const path = root.select<SVGPathElement>('path');
    const originalPath = path.attr('d');
    path.node()!.dispatchEvent(new MouseEvent('mouseenter'));
    expect(path.attr('d')).not.toBe(originalPath);
    path.node()!.dispatchEvent(new MouseEvent('mouseleave'));
    expect(path.attr('d')).toBe(originalPath);
  });
});
