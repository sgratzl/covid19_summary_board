import { select, event } from 'd3-selection';
import 'd3-transition';
import { scaleLinear } from 'd3-scale';
import { accessor, createTemplate } from './utils';

export declare type IStringTableHeader<T> = {
  readonly name: string;
  readonly sortAble?: boolean;
  readonly type: 'string';
  readonly attr: keyof T | ((d: T) => string);
};

export declare type INumberTableHeader<T> = {
  readonly name: string;
  readonly sortAble?: boolean;
  readonly type: 'number';
  readonly color: string;
  readonly domain: [number, number];
  readonly attr: keyof T | ((d: T) => number);
};

export declare type ITableHeader<T> = IStringTableHeader<T> | INumberTableHeader<T>;
export declare type ITableHeaders<T> = ReadonlyArray<ITableHeader<T>>;

declare type TableChartAttributeTypes =
  | 'rows'
  | 'headers'
  | 'selected'
  | 'sorted-column-index'
  | 'sorted-column-order'
  | 'top'
  | 'batch';

export default class TableChart<T = any> extends HTMLElement {
  private static readonly template = createTemplate(`<style>
    :host {
      position: relative;
      display: flex;
      --text: black;
      --th-text: black;
      --th-bg: lightgray;
      --selection-bg: lightgray;
      --selection-text: black;
      --wrapper-position: absolute;
    }
    .wrapper {
      position: var(--wrapper-position);
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      overflow: auto;
    }
    table {
      min-width: 100%;
      color: var(--text);
      border-collapse: collapse;
    }
    th, td {
      padding: 1em;
    }
    th {
      position: sticky;
      top: 0;
      background: var(--th-bg);
      color: var(--th-text);
      text-transform: uppercase;
      z-index: 1;
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
      border-bottom: 1px solid var(--th-bg);
    }
    tbody > tr.selected,
    tbody > tr:hover {
      color: var(--selection-text);
      background: var(--selection-bg);
    }
    .number {
      position: relative;
      text-align: right;
      background-image: linear-gradient(to right, var(--color) 0%, var(--color) var(--width), transparent var(--width));
      background-position: left center;
      background-size: 98% 2em;
      background-repeat: no-repeat;
    }
    .hidden {
      display: none;
    }
    .show-more {
      display: flex;
    }
    .show-more-button {
      flex: 1 1 0;
      padding: 1em;
      border: none;
      outline: none;
      text-transform: uppercase;
      background: none;
      color: var(--th-text);
    }
    .show-more-button:hover {
      font-weight: bold;
    }
    </style>
    <div class="wrapper">
      <table>
        <thead>
          <tr></tr>
        </thead>
        <tbody>
        </tbody>
        <tfoot>
          <tr><td class="hidden"><div class="show-more"><button class="show-more-button">Show More</button></div></td></tr>
        </tfoot>
      </table>
    </div>`);

  readonly #shadow: ShadowRoot;
  #updateCallback = -1;
  #rows: ReadonlyArray<T> = [];
  #headers: ITableHeaders<T> = [];
  #selected = -1;
  #sortedColumnIndex = -1;
  #sortedColumnOrder: 'asc' | 'desc' = 'asc';
  #top = -1;
  #batch = 10;

  constructor() {
    super();

    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.appendChild(TableChart.template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return [
      'rows',
      'header',
      'selected',
      'sorted-column-index',
      'sorted-column-order',
      'top',
      'wrapper',
      'batch',
    ] as TableChartAttributeTypes[];
  }

  attributeChangedCallback(name: TableChartAttributeTypes, oldValue: string, newValue: string) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case 'headers':
        this.#headers = JSON.parse(newValue);
        break;
      case 'rows':
        this.#rows = JSON.parse(newValue);
        break;
      case 'sorted-column-index':
        this.#sortedColumnIndex =
          newValue == null || newValue === '' ? -1 : Math.max(-1, Number.parseInt(newValue, 10));
        break;
      case 'sorted-column-order':
        this.#sortedColumnOrder = newValue === 'desc' ? 'desc' : 'asc';
        break;
      case 'top':
        this.#top = newValue == null || newValue === '' ? -1 : Math.max(-1, Number.parseInt(newValue, 10));
        break;
      case 'selected':
        this.#selected = newValue == null || newValue === '' ? -1 : Math.max(-1, Number.parseInt(newValue, 10));
        break;
      case 'batch':
        this.#batch = newValue == null || newValue === '' ? 1 : Math.max(1, Number.parseInt(newValue, 10));
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
    if (v < -1) {
      throw new Error('must be >= 0 or -1');
    }
    if (v === this.#selected) {
      return;
    }
    this.setAttribute('selected', v.toString());
  }

  get top() {
    return this.#top;
  }

  set top(v: number) {
    if (v < -1) {
      throw new Error('must be >= 0 or -1');
    }
    if (v === this.#top) {
      return;
    }
    this.setAttribute('top', v.toString());
  }

  get batch() {
    return this.#batch;
  }

  set batch(v: number) {
    if (v <= 0) {
      throw new Error('must be >= 0');
    }
    if (v === this.#batch) {
      return;
    }
    this.setAttribute('batch', v.toString());
  }

  get sortedColumnIndex() {
    return this.#sortedColumnIndex;
  }

  set sortedColumnIndex(v: number) {
    if (v < -1) {
      throw new Error('must be >= 0 or -1');
    }
    if (v === this.#sortedColumnIndex) {
      return;
    }
    this.setAttribute('sorted-column-index', v.toString());
  }

  set sortedColumnOrder(v: 'asc' | 'desc') {
    if (v === this.#sortedColumnOrder) {
      return;
    }
    this.setAttribute('sorted-column-order', v);
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
    if (col) {
      const compareFactor = this.#sortedColumnOrder === 'asc' ? -1 : 1;

      indexedData.sort((a, b) => {
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
    if (this.#top < 0 || this.#top >= indexedData.length) {
      return indexedData;
    }

    const visibleSelectedIndex = this.#selected < 0 ? 0 : indexedData.findIndex((d) => d.i === this.#selected);
    return indexedData.slice(0, Math.max(this.#top, visibleSelectedIndex + 1)); // at least the selected
  }

  private increaseTop() {
    this.top = this.#top + this.#batch;
  }

  render() {
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
      .attr('data-color', (d) => (d.type === 'number' ? d.color : null))
      .style('--color', (d) => (d.type === 'number' ? d.color : null))
      .attr('data-sortable', (d, i) =>
        !d.sortAble ? null : this.#sortedColumnIndex === i ? this.#sortedColumnOrder : ''
      )
      .attr('title', (d) => (d.sortAble ? 'Click to sort' : null))
      .text((d) => d.name);

    const sortedData = this.sortedData();
    root
      .select('tbody')
      .selectAll('tr')
      .data(sortedData)
      .join((enter) => {
        const tr = enter.append('tr');
        tr.on('click', (d) => {
          event.preventDefault();
          this.toggleSelection(d.i);
        });
        return tr;
      })
      .attr('data-i', (d) => d.i)
      .classed('selected', (d) => this.#selected === d.i)
      .selectAll('td')
      .data(
        (d) =>
          this.#headers.map(
            (header) =>
              ({ ...header, value: accessor(d.row, header.attr) } as ITableHeader<T> & { value: string | number })
          ),
        (d: ITableHeader<T>) => d.name
      )
      .join('td')
      .classed('number', (d) => d.type === 'number')
      .style('--color', (d) => (d.type === 'number' ? d.color : null))
      .style('--width', (d) =>
        d.type === 'number' ? `${scaleLinear().domain(d.domain).rangeRound([0, 100])(d.value as number)}%` : null
      )
      .text((d) => (typeof d.value === 'number' ? d.value.toLocaleString() : String(d.value)));

    if (this.#selected >= 0) {
      const selectedRow = root.select(`tr[data-i="${this.#selected}"]`).node() as HTMLElement;
      if (selectedRow && typeof selectedRow.scrollIntoView === 'function') {
        selectedRow.scrollIntoView();
      }
    }

    root
      .select('tfoot > tr > td')
      .classed('hidden', sortedData.length === this.#rows.length)
      .attr('colspan', this.#headers.length)
      .select('button')
      .on('click', () => {
        this.increaseTop();
      });
  }
}
customElements.define('table-chart', TableChart);
