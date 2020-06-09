import { select, pie, arc, PieArcDatum } from 'd3';

export declare type IPieSlice = {
  readonly name: string;
  readonly color: string;
  readonly value: number;
};
export declare type IPieChartData = ReadonlyArray<IPieSlice>;

declare type PieChartAttributeTypes = 'data';

export default class PieChart extends HTMLElement {
  readonly #shadow: ShadowRoot;
  #data: IPieChartData = [];
  #updateCallback = -1;

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
    }
    .legend > div::before {
      content: '⬤';
      color: var(--color);
    }
    </style>
    <svg viewBox="0 0 104 104">
      <g transform="translate(52,52)">
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

  private render() {
    const pieData = pie<IPieSlice>()
      .sort(null)
      .value((d) => d.value)(this.#data.slice());
    const arcGenerator = arc<PieArcDatum<IPieSlice>>().innerRadius(0).outerRadius(50);
    const arcGeneratorHover = arc<PieArcDatum<IPieSlice>>().innerRadius(0).outerRadius(52);
    const root = select(this.#shadow).select('svg > g');
    root
      .selectAll('path')
      .data(pieData, (d: PieArcDatum<IPieSlice>) => d.data.name)
      .join((enter) => {
        const p = enter.append('path');
        p.classed('pie-slice', true);
        p.append('title');
        p.on('mouseenter', function (this: SVGPathElement) {
          select(this).transition().attr('d', arcGeneratorHover);
        });
        p.on('mouseleave', function (this: SVGPathElement) {
          select(this).transition().attr('d', arcGenerator);
        });
        return p;
      })
      .attr('d', arcGenerator)
      .style('fill', (d) => d.data.color)
      .select('title')
      .text((d) => `${d.data.name}: ${d.data.value.toLocaleString()}`);

    const legend = select(this.#shadow).select('.legend');
    legend
      .selectAll('div')
      .data(pieData, (d: PieArcDatum<IPieSlice>) => d.data.name)
      .join('div')
      .style('--color', (d) => d.data.color)
      .text((d) => `${d.data.name}: ${d.data.value.toLocaleString()}`);
  }
}
customElements.define('pie-chart', PieChart);
