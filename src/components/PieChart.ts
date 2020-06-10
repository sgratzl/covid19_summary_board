import { select, pie, arc, PieArcDatum, interpolateObject } from 'd3';
import { createTemplate } from './utils';

export declare type IPieSlice = {
  readonly name: string;
  readonly color: string;
  readonly value: number;
};
export declare type IPieChartData = ReadonlyArray<IPieSlice>;

declare type PieChartAttributeTypes = 'data' | 'legend';

const RADIUS = 50;
const HOVER_RADIUS = 52;

export default class PieChart extends HTMLElement {
  private static readonly template = createTemplate(`
  <style>
  :host {
    position: relative;
    display: flex;
    padding-bottom: 4em;
  }
  svg {
    flex: 1 1 0;
  }
  .legend {
    position: absolute;
    bottom: 0;
    right: 0;
  }
  .hidden {
    display: none;
  }
  .legend > div {
    display: flex;
    padding: 0.1em 0.2em;
  }
  .legend > div::before {
    content: '⬤';
    margin-right: 0.2em;
    color: var(--color);
  }
  .legend > div::after {
    content: attr(data-count);
    margin-left: 0.2em;
    text-align: right;
    flex-grow: 1;
  }
  </style>
  <svg viewBox="0 0 ${HOVER_RADIUS * 2} ${HOVER_RADIUS * 2}">
    <g transform="translate(${HOVER_RADIUS},${HOVER_RADIUS})">
    </g>
  </svg>
  <div class="legend">
  </div>`);

  readonly #shadow: ShadowRoot;
  #updateCallback = -1;
  #data: IPieChartData = [];
  #legend = true;

  constructor() {
    super();

    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.appendChild(PieChart.template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ['data', 'legend'] as PieChartAttributeTypes[];
  }

  attributeChangedCallback(name: PieChartAttributeTypes, oldValue: string, newValue: string) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case 'data':
        this.#data = JSON.parse(newValue);
        break;
      case 'legend':
        this.#legend = newValue !== 'false';
    }
    this.scheduleRender();
  }

  private scheduleRender() {
    if (this.#updateCallback >= 0) {
      return;
    }
    this.#updateCallback = requestAnimationFrame(() => {
      this.#updateCallback = -1;
      this.render();
    });
  }

  connectedCallback() {
    this.scheduleRender();
  }

  get data() {
    return this.#data;
  }

  set data(v: IPieChartData) {
    this.#data = v;
    this.scheduleRender();
  }

  get legend() {
    return this.#legend;
  }

  set legend(v: boolean) {
    if (this.#legend === v) {
      return;
    }
    this.#legend = v;
    this.scheduleRender();
  }

  private render() {
    const pieData = pie<IPieSlice>()
      .sort(null)
      .value((d) => d.value)(this.#data.slice());

    const arcGenerator = arc<PieArcDatum<IPieSlice>>().innerRadius(0).outerRadius(RADIUS);
    const arcHoverGenerator = arc<PieArcDatum<IPieSlice>>().innerRadius(0).outerRadius(HOVER_RADIUS);

    const root = select(this.#shadow).select('svg > g');

    // helper for proper animation
    const noSlice: PieArcDatum<IPieSlice> = {
      startAngle: 0,
      endAngle: Math.PI * 2,
      padAngle: 0,
      value: 0,
      index: 0,
      data: { color: '', name: '', value: 0 },
    };

    const oldData = root.selectAll<SVGPathElement, PieArcDatum<IPieSlice>>('path').data();

    // custom arc interpolation for proper angle animation
    function tweenArc(d: PieArcDatum<IPieSlice>, i: number) {
      const interpolate = interpolateObject(oldData[i] ?? noSlice, d);
      return (t: number) => arcGenerator(interpolate(t))!;
    }

    root
      .selectAll('path')
      .data(pieData, (d: PieArcDatum<IPieSlice>) => d.data.name)
      .join(
        (enter) => {
          const p = enter
            .append('path')
            .classed('pie-slice', true)
            .attr('d', () => arcGenerator(noSlice))
            .on('mouseenter', function (this: SVGPathElement) {
              select(this).transition().attr('d', arcHoverGenerator);
            })
            .on('mouseleave', function (this: SVGPathElement) {
              select(this).transition().attr('d', arcGenerator);
            });
          p.append('title');
          return p;
        },
        (update) => update,
        (exit) => {
          exit.transition().attrTween('d', tweenArc).remove();
        }
      )
      .style('fill', (d) => d.data.color)
      .transition()
      .attrTween('d', tweenArc)
      .select('title')
      .text((d) => `${d.data.name}: ${d.data.value.toLocaleString()}`);

    const legend = select(this.#shadow).select('.legend');
    legend.classed('hidden', !this.#legend);
    legend
      .selectAll('div')
      .data(pieData, (d: PieArcDatum<IPieSlice>) => d.data.name)
      .join('div')
      .style('--color', (d) => d.data.color)
      .attr('data-count', (d) => d.data.value.toLocaleString())
      .text((d) => `${d.data.name}:`);
  }
}
customElements.define('pie-chart', PieChart);
