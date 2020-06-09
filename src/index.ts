import PieChart from './components/PieChart';
import { fetchData, preparePieData, tableHeaders } from './data';
import TableChart from './components/TableChart';

async function main() {
  // TODO exception handling
  const data = await fetchData();

  const pieChart = document.querySelector<PieChart>('#pie-chart')!;
  const pieHeader = document.querySelector<HTMLElement>('#pie-header')!;
  const pieSubHeader = document.querySelector<HTMLButtonElement>('#pie-subheader')!;
  const pieClear = document.querySelector<HTMLButtonElement>('#pie-clear')!;

  const tableChart = document.querySelector<TableChart>('#table-chart')!;
  tableChart.headers = tableHeaders;
  tableChart.rows = data.Countries;
  tableChart.sortedColumnIndex = tableHeaders.findIndex((d) => d.sortAble);

  function updateState(selected: number) {
    tableChart.selected = selected;
    pieClear.disabled = selected < 0;

    if (selected < 0) {
      pieHeader.textContent = 'Worldwide';
      pieSubHeader.textContent = data.Global.TotalConfirmed.toLocaleString();
      pieChart.data = preparePieData(data.Global);
    } else {
      const country = data.Countries[selected];
      pieHeader.textContent = country.Country;
      pieSubHeader.textContent = country.TotalConfirmed.toLocaleString();
      pieChart.data = preparePieData(country);
    }
  }
  function updateUrl(selected: number) {
    window.history.pushState({ selected }, '', `#${selected < 0 ? '' : data.Countries[selected].CountryCode}`);
  }

  updateState(window.history.state?.selected ?? -1);

  window.addEventListener('popstate', () => {
    console.log('state', window.history.state?.selected);
    updateState(window.history.state?.selected ?? -1);
  });

  tableChart.addEventListener('select', () => {
    updateState(tableChart.selected);
    updateUrl(tableChart.selected);
  });
  pieClear.addEventListener('click', () => {
    updateState(-1);
    updateUrl(-1);
  });
}

window.addEventListener('load', main);
