import { select, event } from 'd3';
import { accessor, createTemplate } from './utils';

export declare type ITableHeader<T> = {
  readonly name: string;
  readonly color?: string;
  readonly type: 'string' | 'number';
  readonly sortAble?: boolean;
  readonly attr: keyof T | ((d: T) => string | number);
};
export declare type ITableHeaders<T> = ReadonlyArray<ITableHeader<T>>;

declare type TableChartAttributeTypes = 'rows' | 'headers' | 'selected' | 'sortedColumnIndex' | 'sortedColumnOrder';

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
      padding: 0.75em;
    }
    th {
      position: sticky;
      top: 0;
      background: var(--th-bg);
      text-transform: uppercase;
    }    
    th[data-color]::before {
      content: '⬤';
      margin-right: 0.2em;
      color: var(--color);
    }
    th[data-sortable] {
      cursor: s-resize;
    }
    th[data-sortable]::after {
      margin-left: 0.2em;
      content: '⭥';
      opacity: 0.25;
    }
    th[data-sortable=asc]::after {
      content: '⭡';
      opacity: 1;
    }
    th[data-sortable=desc]::after {
      content: '⭣';
      opacity: 1;
    }
    tbody {
      margin-top: 2px;
    }
    tbody > tr {
      cursor: pointer;
    }
    tbody > tr.selected,
    tbody > tr:hover {
      background: var(--selection-bg);
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
  #sortedColumnIndex: number = -1;
  #sortedColumnOrder: 'asc' | 'desc' = 'asc';

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
        this.#selected = newValue == null || newValue === '' ? -1 : Math.max(-1, Number.parseInt(newValue, 10));
        break;
      case 'headers':
        this.#headers = JSON.parse(newValue);
        break;
      case 'rows':
        this.#rows = JSON.parse(newValue);
        break;
      case 'sortedColumnIndex':
        this.#sortedColumnIndex =
          newValue == null || newValue === '' ? -1 : Math.max(-1, Number.parseInt(newValue, 10));
        break;
      case 'sortedColumnOrder':
        this.#sortedColumnOrder = newValue === 'desc' ? 'desc' : 'asc';
        break;
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

  get sortedColumnIndex() {
    return this.#sortedColumnIndex;
  }

  set sortedColumnIndex(v: number) {
    if (v === this.#sortedColumnIndex) {
      return;
    }
    this.#sortedColumnIndex = v;
    this.scheduleRender();
  }

  set sortedColumnOrder(v: 'asc' | 'desc') {
    if (v === this.#sortedColumnOrder) {
      return;
    }
    this.#sortedColumnOrder = v;
    this.scheduleRender();
  }

  get sortedColumnOrder() {
    return this.#sortedColumnOrder;
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
    this.#selected = this.#selected === index ? -1 : index;
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: this.#selected,
      })
    );
    this.scheduleRender();
  }

  private toggleSorting(d: ITableHeader<T>, index: number) {
    const defaultSortOrder = d.type === 'number' ? 'desc' : 'asc';
    if (this.#sortedColumnIndex !== index) {
      // new column
      this.#sortedColumnIndex = index;
      this.#sortedColumnOrder = defaultSortOrder;
    } else if (this.#sortedColumnOrder === defaultSortOrder) {
      // toggle order
      this.#sortedColumnOrder = defaultSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // deselect
      this.#sortedColumnIndex = -1;
    }
    this.dispatchEvent(
      new CustomEvent('sort', {
        detail: {
          column: this.#sortedColumnIndex,
          order: this.#sortedColumnOrder,
        },
      })
    );
    this.scheduleRender();
  }

  private sortedData() {
    const indexedData = this.#rows.map((row, i) => ({ row, i }));
    const col = this.#headers[this.#sortedColumnIndex];
    if (!col) {
      return indexedData;
    }
    const compareFactor = this.#sortedColumnOrder === 'asc' ? -1 : 1;

    return indexedData.sort((a, b) => {
      const va = accessor(a.row, col.attr);
      const vb = accessor(b.row, col.attr);
      if (va === vb) {
        return a.i - b.i; // stable result
      }
      if (va < vb) {
        return compareFactor;
      }
      return -compareFactor;
    });
  }

  private render() {
    const root = select(this.#shadow);
    root
      .select('thead > tr')
      .selectAll('th')
      .data(this.#headers.slice(), (d: ITableHeader<T>) => d.name)
      .join((enter) =>
        enter.append('th').on('click', (d, i) => {
          if (!d.sortAble) {
            return;
          }
          event.preventDefault();
          this.toggleSorting(d, i);
        })
      )
      .attr('data-color', (d) => d.color ?? null)
      .style('--color', (d) => d.color)
      .attr('data-sortable', (d, i) =>
        !d.sortAble ? null : this.#sortedColumnIndex === i ? this.#sortedColumnOrder : ''
      )
      .attr('title', (d) => (d.sortAble ? 'Click to sort' : null))
      .text((d) => d.name);

    root
      .select('tbody')
      .selectAll('tr')
      .data(this.sortedData())
      .join((enter) => {
        const tr = enter.append('tr');
        tr.on('click', (d) => {
          event.preventDefault();
          this.toggleSelection(d.i);
        });
        return tr;
      })
      .classed('selected', (d) => this.#selected === d.i)
      .selectAll('td')
      .data(
        (d) => this.#headers.map((header) => ({ ...header, value: accessor(d.row, header.attr) })),
        (d: ITableHeader<T>) => d.name
      )
      .join('td')
      .classed('number', (d) => d.type === 'number')
      .text((d) => (typeof d.value === 'number' ? d.value.toLocaleString() : String(d.value)));
  }
}
customElements.define('table-chart', TableChart);
