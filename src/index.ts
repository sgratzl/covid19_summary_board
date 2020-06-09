import PieChart from './components/PieChart';
import { fetchData, preparePieData, tableHeaders } from './data';
import TableChart from './components/TableChart';

async function main() {
  // TODO exception handling
  const data = await fetchData();

  const pieChart = document.querySelector<PieChart>('#pie-chart')!;
  const pieHeader = document.querySelector<HTMLElement>('#pie-header')!;
  pieHeader.textContent = 'Worldwide';
  pieChart.data = preparePieData(data.Global);

  const tableChart = document.querySelector<TableChart>('#table-chart')!;
  tableChart.headers = tableHeaders;
  tableChart.rows = data.Countries;
}

window.addEventListener('load', main);
