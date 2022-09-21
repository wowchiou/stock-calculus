<script setup>
import { ref, watch, computed, watchEffect, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import dataList from '@/data';
import StockDataTable from '@/components/StockDataTable.vue';

const myChartRef = ref(null);
const stocksRef = ref(null);
const stock = ref('0056');
const comparisonStocks = ref(['0050', '0056']);
const twoCoinList = ref([]);
const fixedDepositList = ref([]);
const startMoneyInput = ref(300000);
const investMoneyInput = ref(30000);
const buyRate = ref(0.05);
const saleRate = ref(0.05);
const totalInvest = ref(0);
const depositRate = ref(1);
const startMoney = computed(() => +startMoneyInput.value);
const investMoney = computed(() => +investMoneyInput.value);

let chart = null;
let comparisonStocksChart = null;

watch(stocksRef, (newValue, oldValue) => {
  if (newValue !== oldValue) setComparisonStocks();
});

watchEffect(async () => {
  if (!fixedDepositList.value.length && !twoCoinList.length) return;
  await nextTick();
  if (chart) chart.destroy();
  chart = new Chart(myChartRef.value, {
    type: 'line',
    data: {
      labels: fixedDepositList.value.map((itm) => itm.date).reverse(),
      datasets: [
        {
          label: '股票總價值',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: fixedDepositList.value.map((itm) => itm.totalMoney).reverse(),
          yAxisID: 'y',
        },
        {
          label: '股價',
          backgroundColor: 'rgb(25, 99, 255)',
          borderColor: 'rgb(25, 99, 255)',
          data: fixedDepositList.value.map((itm) => itm.prize).reverse(),
          yAxisID: 'y1',
        },
        {
          label: '總投入資金',
          backgroundColor: 'rgb(100, 100, 100)',
          borderColor: 'rgb(100, 100, 100)',
          data: fixedDepositList.value.map((itm) => itm.investMoney).reverse(),
          yAxisID: 'y',
        },
      ],
    },
    options: {
      responsive: true,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: dataList.find((itm) => itm.id === stock.value).label,
        },
      },
    },
  });
});

function setComparisonStocks() {
  if (!comparisonStocks.value || !comparisonStocks.value.length) return;
  if (comparisonStocksChart) comparisonStocksChart.destroy();
  const datasets = [];
  const stocksDataList = comparisonStocks.value.map((stockId, index) => {
    const stockData = getStockSimulation(stockId).fixedDepositList;
    if (index === 0) {
      datasets.push({
        label: '總投入資金',
        backgroundColor: 'rgb(100, 100, 100)',
        borderColor: 'rgb(100, 100, 100)',
        data: stockData.map((itm) => itm.investMoney).reverse(),
      });
    }
    const color = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, 255)`;
    datasets.push({
      label: dataList.find((itm) => itm.id === stockId).label,
      backgroundColor: color,
      borderColor: color,
      data: stockData.map((itm) => itm.totalMoney).reverse(),
    });
    return {
      id: stockId,
      data: stockData,
    };
  });
  comparisonStocksChart = new Chart(stocksRef.value, {
    type: 'line',
    data: {
      labels: stocksDataList[0].data.map((itm) => itm.date).reverse(),
      datasets,
    },
    options: {
      responsive: true,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: '定期定額比較表',
        },
      },
    },
  });
}

function getStockSimulation(stockId) {
  let money = startMoney.value;
  let fixedDepositMoney = 0;
  let fixedDepositStockAmount = 0;
  let stockAmount = 0;
  let nowMonth = '';
  let fixedDepositList = [];
  let twoCoinList = [];
  const stockItem = dataList.find((itm) => itm.id === stockId);
  stockItem.list.forEach(({ date, prize }, idx) => {
    const [year, month, day] = date.split('/');

    const cashDividendItem = stockItem.cashDividend.find(
      (itm) => itm.date === date
    );

    const fixedDepositMoneyRate = depositRate.value;

    // 第一筆資料，建倉
    if (idx === 0) {
      nowMonth = month;
      totalInvest.value = startMoney.value;
      money = startMoney.value * 0.5;
      stockAmount = formatStockAmount(money / (prize * 1000));
      twoCoinList = [
        {
          date,
          prize,
          status: 'build',
          stockAmount,
          action: '',
          money,
          totalStockValue: Math.floor(prize * 1000 * stockAmount),
          totalMoney: Math.floor(money + stockAmount * (prize * 1000)),
        },
      ];
      fixedDepositMoney = startMoney.value * (1 - fixedDepositMoneyRate);
      fixedDepositStockAmount = formatStockAmount(
        (startMoney.value * fixedDepositMoneyRate) / (prize * 1000)
      );
      fixedDepositList = [
        {
          date,
          prize,
          status: 'build',
          stockAmount: fixedDepositStockAmount,
          action: '',
          money: fixedDepositMoney,
          totalStockValue: Math.floor(prize * 1000 * fixedDepositStockAmount),
          totalMoney: Math.floor(
            fixedDepositMoney + fixedDepositStockAmount * (prize * 1000)
          ),
          investMoney: totalInvest.value,
        },
      ];
      return;
    }

    // 發股息日將資金加入
    let cashDividendMoney = 0;
    if (cashDividendItem) {
      const originStockAmount = fixedDepositStockAmount;
      cashDividendMoney = Math.floor(
        cashDividendItem.cashDividend * 1000 * originStockAmount
      );
      fixedDepositStockAmount += formatStockAmount(
        cashDividendMoney / (prize * 1000)
      );
      if (cashDividendItem.stockDividend) {
        fixedDepositStockAmount +=
          ((cashDividendItem.stockDividend / 10) * 1000 * originStockAmount) /
          1000;
      }
      // fixedDepositList.unshift({
      //   date,
      //   prize,
      //   status: `股息${cashDividendMoney} 股票${(
      //     ((cashDividendItem.stockDividend / 10) * 1000 * originStockAmount) /
      //     1000
      //   ).toFixed(2)}`,
      //   stockAmount: fixedDepositStockAmount,
      //   action: '',
      //   money: fixedDepositMoney,
      //   totalStockValue: Math.floor(prize * 1000 * fixedDepositStockAmount),
      //   totalMoney: Math.floor(
      //     fixedDepositMoney + fixedDepositStockAmount * (prize * 1000)
      //   ),
      // });
    }

    // 每月投資資金
    if (!nowMonth || nowMonth !== month) {
      nowMonth = month;
      money += investMoney.value;
      totalInvest.value += investMoney.value;
      if (typeof investMoney.value !== 'number') return;
      fixedDepositMoney += investMoney.value * (1 - fixedDepositMoneyRate);
      fixedDepositStockAmount += formatStockAmount(
        (investMoney.value * fixedDepositMoneyRate) / (prize * 1000)
      );
      fixedDepositList.unshift({
        date,
        prize,
        status: 'buy',
        stockAmount: fixedDepositStockAmount,
        action: formatStockAmount(
          (investMoney.value * fixedDepositMoneyRate) / (prize * 1000)
        ),
        money: fixedDepositMoney,
        totalStockValue: Math.floor(prize * 1000 * fixedDepositStockAmount),
        totalMoney: Math.floor(
          fixedDepositMoney + fixedDepositStockAmount * (prize * 1000)
        ),
        investMoney: totalInvest.value,
      });
    }

    // 雙幣理論
    // 如果是加碼日，用剩餘現金買進股票
    if (stockItem.bonusDay) {
      const isBonusDay = stockItem.bonusDay.includes(date);
      if (isBonusDay && fixedDepositMoney) {
        fixedDepositStockAmount += formatStockAmount(
          fixedDepositMoney / (prize * 1000)
        );
        fixedDepositList.unshift({
          date,
          prize,
          status: '加碼日',
          stockAmount: fixedDepositStockAmount,
          action: formatStockAmount(fixedDepositMoney / (prize * 1000)),
          money: 0,
          totalStockValue: Math.floor(prize * 1000 * fixedDepositStockAmount),
          totalMoney: Math.floor(fixedDepositStockAmount * (prize * 1000)),
          investMoney: totalInvest.value,
        });
        fixedDepositMoney = 0;
      }
    }

    if (cashDividendItem) {
      money += Math.floor(cashDividendItem.cashDividend * 1000 * stockAmount);
      if (cashDividendItem.stockDividend) {
        stockAmount +=
          ((cashDividendItem.stockDividend / 10) * 1000 * stockAmount) / 1000;
      }
    }

    const stockValue = prize * 1000;
    const totalStockValue = Math.floor(stockValue * stockAmount);
    const goalTop = money * (1 + saleRate.value);
    const goalBottom = money * (1 - buyRate.value);

    // 如果股票價值小於goalBottom，買進股票
    if (totalStockValue < goalBottom) {
      const moneyRange = (money - totalStockValue) / 2;
      money -= moneyRange;
      stockAmount += formatStockAmount(moneyRange / stockValue);
      twoCoinList.unshift({
        date,
        prize,
        status: 'buy',
        stockAmount,
        action: formatStockAmount(moneyRange / stockValue),
        money,
        totalStockValue: Math.floor(stockValue * stockAmount),
        totalMoney: Math.floor(money + stockAmount * stockValue),
      });
    }

    // 如果股票價值大於goalTop，賣出股票
    if (totalStockValue > goalTop) {
      const moneyRange = (totalStockValue - money) / 2;
      money += moneyRange;
      stockAmount -= formatStockAmount(moneyRange / stockValue);
      twoCoinList.unshift({
        date,
        prize,
        status: 'sale',
        stockAmount,
        action: -formatStockAmount(moneyRange / stockValue),
        money,
        totalStockValue: Math.floor(stockValue * stockAmount),
        totalMoney: Math.floor(money + stockAmount * stockValue),
      });
    }
  });
  return {
    twoCoinList,
    fixedDepositList,
  };
}

function handleSubmit(stockId) {
  const list = getStockSimulation(stockId);
  twoCoinList.value = list.twoCoinList;
  fixedDepositList.value = list.fixedDepositList;
}

function formatStockAmount(number, fixed) {
  let fixedNumber = fixed || 2;
  return Number(number.toFixed(fixedNumber));
}
</script>

<template>
  <div class="app">
    <div class="compare">
      <p>欲比較股票</p>
      <el-select
        v-model="comparisonStocks"
        :style="{ width: '100%' }"
        multiple
        placeholder="請選擇股票"
      >
        <el-option
          v-for="item in dataList"
          :key="item.id"
          :label="item.label"
          :value="item.id"
        />
      </el-select>
      <el-button type="primary" @click="setComparisonStocks">比對</el-button>
    </div>
    <canvas ref="stocksRef" id="stocksRef"></canvas>
    <hr />
    <div class="form">
      <label>
        股票代碼
        <el-select v-model="stock">
          <el-option v-for="itm in dataList" :key="itm.id" :value="itm.id">
            {{ itm.label }}
          </el-option>
        </el-select>
      </label>
      <label>
        起始資金
        <el-input v-model="startMoneyInput" type="number" min="0" />
      </label>
      <label>
        每月投資金額
        <el-input v-model="investMoneyInput" type="number" min="0" />
      </label>
      <!-- <label>
        平衡買進趴數
        <el-input v-model="buyRate" type="number" min="0" />
      </label>
      <label>
        平衡賣出趴數
        <el-input v-model="saleRate" type="number" min="0" />
      </label>
      <label>
        定期定額資金運用比例
        <el-input v-model="depositRate" type="number" min="0" />
      </label> -->
      <el-button
        type="primary"
        :style="{ width: '100%' }"
        @click="handleSubmit(stock)"
        >模擬</el-button
      >
    </div>
    <hr />
    <div v-if="fixedDepositList.length" :style="{ textAlign: 'center' }">
      總投資金額： {{ totalInvest }}
    </div>
    <canvas
      ref="myChartRef"
      id="myChartRef"
      v-if="fixedDepositList.length"
    ></canvas>
    <div class="tables">
      <!-- <div class="table" v-if="twoCoinList.length">
        <p>雙幣理論</p>
        <StockDataTable :stockList="twoCoinList" />
      </div> -->
      <div class="table" v-if="fixedDepositList.length">
        <StockDataTable :stockList="fixedDepositList" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app {
  padding: 10px;
  max-width: 1000px;
  margin: auto;
}
.compare {
  display: flex;
  align-items: center;
  gap: 10px;
  .el-select {
    flex: 1;
  }
}
hr {
  margin: 20px 0;
}
.form label {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  .el-input,
  .el-select {
    flex: 1;
  }
}
.form label + label {
  margin-top: 10px;
}
.form button {
  margin-top: 10px;
}
.tables {
  // display: flex;
  // justify-content: center;
  // align-items: flex-start;
  margin-top: 20px;
}
.tables .table + .table {
  margin-left: 20px;
}
#stocksRef {
  margin-bottom: 20px;
}
</style>
