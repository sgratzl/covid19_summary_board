import PieChart from './components/PieChart';
import { fetchData, preparePieData } from './data/index';

async function main() {
  // TODO exception handling
  const data = await fetchData();

  const pieChart = document.querySelector<PieChart>('#pie-chart')!;
  const pieHeader = document.querySelector<HTMLElement>('#pie-header')!;
  pieHeader.textContent = 'Worldwide';
  pieChart.data = preparePieData(data.Global);
}

window.addEventListener('load', main);
