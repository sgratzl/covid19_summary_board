import { select, color } from 'd3';
import { accessor, createTemplate } from './utils';

export declare type ITableHeader<T> = {
  readonly name: string;
  readonly color?: string;
  readonly type: 'string' | 'number';
  readonly attr: keyof T | ((d: T) => string | number);
};
export declare type ITableHeaders<T> = ReadonlyArray<ITableHeader<T>>;

declare type TableChartAttributeTypes = 'rows' | 'headers' | 'selected';

export default class TableChart<T = any> extends HTMLElement {
  private static readonly template = createTemplate(`<style>
    :host {
      position: relative;
      display: flex;
      --th-bg: white;
      --selection-bg: orange;
    }
    .wrapper {
      position: absolute;
      top: 0.2em;
      right: 0.2em;
      left: 0.2em;
      bottom: 0.2em;
      overflow: auto;
    }
    table {
      border-collapse: collapse;
    }
    th, td {
      padding: 0.25em;
    }
    th {
      position: sticky;
      top: 0;
      background: var(--th-bg);
    }    
    th[data-color]::before {
      content: '⬤';
      margin-right: 0.2em;
      color: var(--color);
    }
    tr {
      cursor: pointer;
    }
    tr.selected,
    tr:hover {
      box-shadow: 0 0 1px 1px var(--selection-bg);
    }
    .number {
      text-align: right;
      padding-right: 0.2em;
    }
    </style>
    <div class="wrapper">
      <table>
        <thead>
          <tr></tr>
        </thead>
        <tbody>
        </tbody>
      </table>
    </div>`);

  readonly #shadow: ShadowRoot;
  #updateCallback = -1;
  #rows: ReadonlyArray<T> = [];
  #headers: ITableHeaders<T> = [];
  #selected: number = -1;

  constructor() {
    super();

    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.appendChild(TableChart.template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ['rows', 'header', 'selected'] as TableChartAttributeTypes[];
  }

  attributeChangedCallback(name: TableChartAttributeTypes, oldValue: string, newValue: string) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case 'selected':
        this.#selected = newValue == null || newValue === '' ? -1 : Number.parseInt(newValue, 10);
        break;
      case 'headers':
        this.#headers = JSON.parse(newValue);
        break;
      case 'rows':
        this.#rows = JSON.parse(newValue);
    }
    this.scheduleRender();
  }

  connectedCallback() {
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

  get selected() {
    return this.#selected;
  }

  set selected(v: number) {
    if (v === this.#selected) {
      return;
    }
    this.#selected = v;
    this.scheduleRender();
  }

  get rows() {
    return this.#rows;
  }

  set rows(v: ReadonlyArray<T>) {
    if (v === this.#rows) {
      return;
    }
    this.#rows = v;
    this.scheduleRender();
  }

  get headers() {
    return this.#headers;
  }

  set headers(v: ITableHeaders<T>) {
    if (v === this.#headers) {
      return;
    }

    this.#headers = v;
    this.scheduleRender();
  }

  private toggleSelection(index: number) {
    this.selected = this.#selected === index ? -1 : index;
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: this.#selected,
      })
    );
  }

  private render() {
    const root = select(this.#shadow);

    root
      .select('thead > tr')
      .selectAll('th')
      .data(this.#headers.slice(), (d: ITableHeader<T>) => d.name)
      .join('th')
      .attr('data-color', (d) => d.color ?? null)
      .style('--color', (d) => d.color)
      .text((d) => d.name);

    root
      .select('tbody')
      .selectAll('tr')
      .data(this.#rows.slice())
      .join((enter) => {
        const tr = enter.append('tr');
        tr.on('click', (_, i) => {
          this.toggleSelection(i);
        });
        return tr;
      })
      .classed('selected', (_, i) => this.#selected === i)
      .selectAll('td')
      .data(
        (row) => this.#headers.map((header) => ({ ...header, value: accessor(row, header.attr) })),
        (d: ITableHeader<T>) => d.name
      )
      .join('td')
      .classed('number', (d) => d.type === 'number')
      .text((d) => (typeof d.value === 'number' ? d.value.toLocaleString() : String(d.value)));
  }
}
customElements.define('table-chart', TableChart);
