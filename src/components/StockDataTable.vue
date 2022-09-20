<script setup>
import { defineProps } from 'vue';
defineProps({
  stockList: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>日期</th>
        <th>價格</th>
        <th>動作</th>
        <th>股票張數</th>
        <th>股票總值</th>
        <th>現金餘額</th>
        <th>總資產</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in stockList" :key="item.date">
        <td>{{ item.date }}</td>
        <td>{{ item.prize }}</td>
        <td :style="{ color: item.status === 'buy' ? 'green' : 'red' }">
          {{ item.status }} {{ item.action }}
        </td>
        <td>{{ item.stockAmount.toFixed(2) }}</td>
        <td class="right">{{ item.totalStockValue }}</td>
        <td class="right">{{ Math.floor(item.money) }}</td>
        <td class="right">{{ item.totalMoney }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style>
th,
td {
  text-align: center;
  border: 1px solid #ccc;
  padding: 5px 10px;
  white-space: nowrap;
}
td.right {
  text-align: right;
}
</style>
