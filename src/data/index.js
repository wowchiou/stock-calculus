import prize0056 from '@/data/prize0056.json';
import prize0050 from '@/data/prize0050.json';
import prize00878 from '@/data/prize00878.json';
import prize00713 from '@/data/prize00713.json';
import prize2880 from '@/data/prize2880.json';
import prize2881 from '@/data/prize2881.json';
import prize2882 from '@/data/prize2882.json';
import prize2883 from '@/data/prize2883.json';
import prize2884 from '@/data/prize2884.json';
import prize2886 from '@/data/prize2886.json';
import prize1513 from '@/data/prize1513.json';
import prize8069 from '@/data/prize8069.json';

const stockList = [
  {
    id: '0056',
    label: '0056 元大高股息',
    list: prize0056.prize.reverse(),
    cashDividend: prize0056.cashDividend,
  },
  {
    id: '0050',
    label: '0050 元大台灣50',
    list: prize0050.prize.reverse(),
    cashDividend: prize0050.cashDividend,
  },
  {
    id: '00878',
    label: '00878 國泰永續高股息',
    list: prize00878.prize.reverse(),
    cashDividend: prize00878.cashDividend,
  },
  {
    id: '00713',
    label: '00713 元大台灣高息低波',
    list: prize00713.prize.reverse(),
    cashDividend: prize00713.cashDividend,
  },
  {
    id: '2880',
    label: '2880 華南金',
    list: prize2880.prize.reverse(),
    cashDividend: prize2880.cashDividend,
  },
  {
    id: '2881',
    label: '2881 富邦金',
    list: prize2881.prize.reverse(),
    cashDividend: prize2881.cashDividend,
  },
  {
    id: '2882',
    label: '2882 國泰金',
    list: prize2882.prize.reverse(),
    cashDividend: prize2882.cashDividend,
  },
  {
    id: '2883',
    label: '2883 開發金',
    list: prize2883.prize.reverse(),
    cashDividend: prize2883.cashDividend,
  },
  {
    id: '2884',
    label: '2884 玉山金',
    list: prize2884.prize.reverse(),
    cashDividend: prize2884.cashDividend,
  },
  {
    id: '2886',
    label: '2886 兆豐金',
    list: prize2886.prize.reverse(),
    cashDividend: prize2886.cashDividend,
  },
  {
    id: '1513',
    label: '1513 中興電',
    list: prize1513.prize.reverse(),
    cashDividend: prize1513.cashDividend,
  },
  {
    id: '8069',
    label: '8069 元太EIH',
    list: prize8069.prize.reverse(),
    cashDividend: prize8069.cashDividend,
  },
];

export default stockList;
