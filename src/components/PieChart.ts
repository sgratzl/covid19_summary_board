import { select, pie, arc, PieArcDatum } from 'd3';

export declare type PieSlice = {
  readonly name: string;
  readonly color: string;
  readonly value: number;
};
export declare type PieChartData = ReadonlyArray<PieSlice>;

declare type PieChartAttributeTypes = 'data';

export default class PieChart extends HTMLElement {
  readonly #shadow: ShadowRoot;
  #data: PieChartData = [];

  constructor() {
    super();

    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.innerHTML = `
    <style>
    :host {
      position: relative;
      display: flex;
    }
    svg {
      flex: 1 1 0;
    }
    .legend {
      position: absolute;
      bottom: 0;
      right: 0;
    }
    .legend > div {
      padding: 0.1em 0.2em 0.1em 1.2em;
      background-position: left center;
      background-size: 1em 1em;
    }
    </style>
    <svg viewBox="0 0 100 100">
      <g transform="translate(50,50)">
      </g>
    </svg>
    <div class="legend">
    </div>`;
  }

  static get observedAttributes() {
    return ['data'] as PieChartAttributeTypes[];
  }

  attributeChangedCallback(name: PieChartAttributeTypes, oldValue: string, newValue: string) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case 'data':
        this.#data = JSON.parse(newValue);
        break;
    }
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  get data() {
    return this.#data;
  }

  set data(v: PieChartData) {
    this.#data = v;
    this.render();
  }

  private render() {
    const pieData = pie<PieSlice>()
      .sort(null)
      .value((d) => d.value)(this.#data.slice());
    const arcGenerator = arc<PieArcDatum<PieSlice>>().innerRadius(0).outerRadius(50);
    const root = select(this.#shadow).select('svg > g');
    root
      .selectAll('path')
      .data(pieData, (d: PieArcDatum<PieSlice>) => d.data.name)
      .join((enter) => {
        const p = enter.append('path');
        p.append('title');
        return p;
      })
      .attr('d', arcGenerator)
      .style('fill', (d) => d.data.color)
      .select('title')
      .text((d) => `${d.data.name}: ${d.data.value.toLocaleString()}`);

    const legend = select(this.#shadow).select('.legend');
    legend
      .selectAll('div')
      .data(pieData, (d: PieArcDatum<PieSlice>) => d.data.name)
      .join('div')
      .style('background-color', (d) => d.data.color)
      .text((d) => `${d.data.name}: ${d.data.value.toLocaleString()}`);
  }
}
customElements.define('pie-chart-component', PieChart);
