import PieChart from './components/PieChart';
import { fetchData, preparePieData, tableHeaders } from './data';
import TableChart from './components/TableChart';

async function main() {
  // TODO exception handling
  const data = await fetchData();

  const pieChart = document.querySelector<PieChart>('#pie-chart')!;
  const pieHeader = document.querySelector<HTMLElement>('#pie-header')!;
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
      pieChart.data = preparePieData(data.Global);
    } else {
      const country = data.Countries[selected];
      pieHeader.textContent = country.Country;
      pieChart.data = preparePieData(country);
    }
  }
  updateState(-1); // start with world
  tableChart.addEventListener('select', () => {
    updateState(tableChart.selected);
  });
  pieClear.addEventListener('click', () => {
    updateState(-1);
  });
}

window.addEventListener('load', main);
