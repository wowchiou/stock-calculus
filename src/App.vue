<script setup>
import { ref } from 'vue';
import dataList from '@/data';
import StockDataTable from '@/components/StockDataTable.vue';

const stock = ref('0056');
const twoCoinList = ref([]);
const fixedDepositList = ref([]);
const startMoney = ref(650000);
const investMoney = ref(30000);
const buyRate = ref(0.05);
const saleRate = ref(0.05);
const totalInvest = ref(0);
const depositRate = ref(1);
let money = 650000;
let fixedDepositMoney = 0;
let fixedDepositStockAmount = 0;
let stockAmount = 0;
let nowMonth = '';

function getStockSimulation() {
  money = startMoney.value;
  const stockItem = dataList.find((itm) => itm.id === stock.value);
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
      twoCoinList.value = [
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
      fixedDepositList.value = [
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
      fixedDepositList.value.unshift({
        date,
        prize,
        status: `股息${cashDividendMoney} 股票${(
          ((cashDividendItem.stockDividend / 10) * 1000 * originStockAmount) /
          1000
        ).toFixed(2)}`,
        stockAmount: fixedDepositStockAmount,
        action: '',
        money: fixedDepositMoney,
        totalStockValue: Math.floor(prize * 1000 * fixedDepositStockAmount),
        totalMoney: Math.floor(
          fixedDepositMoney + fixedDepositStockAmount * (prize * 1000)
        ),
      });
    }

    // 每月投資資金
    if (!nowMonth || nowMonth !== month) {
      nowMonth = month;
      money += investMoney.value;
      totalInvest.value += investMoney.value;
      if (!investMoney.value) return;
      fixedDepositMoney += investMoney.value * (1 - fixedDepositMoneyRate);
      fixedDepositStockAmount += formatStockAmount(
        (investMoney.value * fixedDepositMoneyRate) / (prize * 1000)
      );
      fixedDepositList.value.unshift({
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
      });
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
      twoCoinList.value.unshift({
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
      twoCoinList.value.unshift({
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
}

function formatStockAmount(number, fixed) {
  let fixedNumber = fixed || 2;
  return Number(number.toFixed(fixedNumber));
}
</script>

<template>
  <div class="app">
    <div class="form">
      <label>
        股票代碼
        <select v-model="stock">
          <option v-for="itm in dataList" :key="itm.id" :value="itm.id">
            {{ itm.label }}
          </option>
        </select>
      </label>
      <label>
        起始資金
        <input v-model="startMoney" type="number" min="0" />
      </label>
      <label>
        每月投資金額
        <input v-model="investMoney" type="number" min="0" />
      </label>
      <label>
        平衡買進趴數
        <input v-model="buyRate" type="number" min="0" />
      </label>
      <label>
        平衡賣出趴數
        <input v-model="saleRate" type="number" min="0" />
      </label>
      <label>
        定期定額資金運用比例
        <input v-model="depositRate" type="number" min="0" />
      </label>
      <button @click="getStockSimulation">模擬</button>
    </div>
    <div>總投資金額： {{ totalInvest }}</div>
    <div class="tables">
      <div class="table">
        <p>雙幣理論</p>
        <StockDataTable :stockList="twoCoinList" />
      </div>
      <div class="table">
        <p>每月定存</p>
        <StockDataTable :stockList="fixedDepositList" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  padding: 10px;
}
.form {
  margin-bottom: 20px;
}
.form label + label {
  margin-left: 10px;
}
.form button {
  margin-left: 10px;
}
.tables {
  display: flex;
}
.tables .table + .table {
  margin-left: 20px;
}
</style>
