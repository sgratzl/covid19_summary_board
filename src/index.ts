import PieChart from './components/PieChart';
import { fetchData, preparePieData, generateTableHeaders, ISummaryData } from './data';
import TableChart from './components/TableChart';

async function main() {
  const loading = document.querySelector<HTMLElement>('.loading')!;
  const pieChart = document.querySelector<PieChart>('#pie-chart')!;
  const pieHeader = document.querySelector<HTMLElement>('#pie-header')!;
  const pieSubHeader = document.querySelector<HTMLButtonElement>('#pie-subheader')!;
  const clearButton = document.querySelector<HTMLButtonElement>('#pie-clear')!;

  const tableChart = document.querySelector<TableChart>('#table-chart')!;

  let data: Readonly<ISummaryData> | null = null;
  try {
    data = await fetchData();
  } catch (error) {
    loading.textContent = 'Error during loading data, please try later';
    loading.classList.add('loading-error');
    console.error(error);
  }
  if (!data) {
    return;
  }

  loading.style.display = 'none';

  const headers = generateTableHeaders(data);
  tableChart.headers = headers;
  tableChart.rows = data.Countries;
  // sort by total number of cases
  tableChart.sortedColumnOrder = 'desc';
  tableChart.sortedColumnIndex = 1;

  function updateState(selected: number) {
    tableChart.selected = selected;
    clearButton.disabled = selected < 0;

    pieHeader.textContent = selected < 0 ? 'Worldwide' : data.Countries[selected]?.Country ?? 'Worldwide';
    const stats = selected < 0 ? data.Global : data.Countries[selected] ?? data.Global;
    pieSubHeader.textContent = stats.TotalConfirmed.toLocaleString();
    pieChart.data = preparePieData(stats);
  }
  function updateUrl(selected: number) {
    window.history.pushState({ selected }, '', `#${selected < 0 ? '' : data.Countries[selected]?.CountryCode ?? ''}`);
  }

  function determineInitialSelection() {
    const state = window.history.state?.selected ?? -1;
    if (state >= 0) {
      return state;
    }
    // check hash
    const hash = window.location.hash.slice(1);
    if (!hash) {
      return -1;
    }
    return data.Countries.findIndex((d) => d.CountryCode === hash);
  }

  updateState(determineInitialSelection());

  window.addEventListener('popstate', () => {
    updateState(window.history.state?.selected ?? -1);
  });

  tableChart.addEventListener('select', () => {
    updateState(tableChart.selected);
    updateUrl(tableChart.selected);
  });
  clearButton.addEventListener('click', () => {
    updateState(-1);
    updateUrl(-1);
  });
}

window.addEventListener('load', main);
