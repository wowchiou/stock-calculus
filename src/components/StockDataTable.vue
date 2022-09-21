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
  <el-table :data="stockList" height="500">
    <el-table-column fixed prop="date" label="日期" />

    <el-table-column prop="prize" label="價格" />

    <el-table-column label="動作">
      <template #default="{ row }">
        <span :style="{ color: row.status === 'buy' ? 'green' : 'red' }">
          {{ row.status }} {{ row.action }}
        </span>
      </template>
    </el-table-column>

    <el-table-column label="股票張數">
      <template #default="{ row }">
        {{ row.stockAmount.toFixed(2) }}
      </template>
    </el-table-column>

    <el-table-column prop="totalStockValue" label="股票總值" />

    <el-table-column label="現金餘額">
      <template #default="{ row }">
        {{ row.money.toFixed(2) }}
      </template>
    </el-table-column>

    <el-table-column prop="investMoney" label="總投資資金" />

    <el-table-column prop="totalMoney" label="總資產" />
  </el-table>
</template>

<style></style>
