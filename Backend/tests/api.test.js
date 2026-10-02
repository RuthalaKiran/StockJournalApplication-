import assert from 'assert';
import { calculateRiskReward, calculateTradeMetrics } from '../src/utils/calculations.js';

console.log('🧪 Running TradeJournal Unit & Calculation Tests...\n');

// Test 1: R:R ratio calculation for BUY
const buyRR = calculateRiskReward('BUY', 100, 90, 120);
assert.strictEqual(buyRR, '1:2', 'BUY R:R calculation should be 1:2');
console.log('✅ Test 1 Passed: calculateRiskReward for BUY produces 1:2');

// Test 2: R:R ratio calculation for SELL
const sellRR = calculateRiskReward('SELL', 100, 110, 80);
assert.strictEqual(sellRR, '1:2', 'SELL R:R calculation should be 1:2');
console.log('✅ Test 2 Passed: calculateRiskReward for SELL produces 1:2');

// Test 3: R:R decimal formatting
const decimalRR = calculateRiskReward('BUY', 100, 90, 115);
assert.strictEqual(decimalRR, '1:1.5', 'BUY R:R decimal should be 1:1.5');
console.log('✅ Test 3 Passed: calculateRiskReward produces valid 1:1.5 ratio');

// Test 4: Metrics calculation test
const sampleTrades = [
  {
    instrument: 'XAUUSD',
    direction: 'BUY',
    status: 'CLOSED',
    result: 'TP',
    profitLoss: 200,
    entryDate: '2026-10-01T10:00:00.000Z',
  },
  {
    instrument: 'EURUSD',
    direction: 'SELL',
    status: 'CLOSED',
    result: 'SL',
    profitLoss: -100,
    entryDate: '2026-10-02T10:00:00.000Z',
  },
  {
    instrument: 'GBPUSD',
    direction: 'BUY',
    status: 'CLOSED',
    result: 'BE',
    profitLoss: 0,
    entryDate: '2026-10-03T10:00:00.000Z',
  },
  {
    instrument: 'BTCUSD',
    direction: 'BUY',
    status: 'CLOSED',
    result: 'TP',
    profitLoss: 400,
    entryDate: '2026-10-04T10:00:00.000Z',
  },
];

const metrics = calculateTradeMetrics(sampleTrades);

// Total Trades: 4
assert.strictEqual(metrics.totalTrades, 4, 'Total trades must be 4');
// Total P/L: 200 - 100 + 0 + 400 = 500
assert.strictEqual(metrics.totalPnL, 500, 'Total PnL must be 500');
// Winning: 2, Losing: 1, BE: 1
assert.strictEqual(metrics.winningTrades, 2, 'Winning trades must be 2');
assert.strictEqual(metrics.losingTrades, 1, 'Losing trades must be 1');
assert.strictEqual(metrics.breakEvenTrades, 1, 'Break even trades must be 1');
// Win Rate: 2/4 = 50.0%
assert.strictEqual(metrics.winRate, 50.0, 'Win rate must be 50%');
// Loss Rate: 1/4 = 25.0%
assert.strictEqual(metrics.lossRate, 25.0, 'Loss rate must be 25%');
// Profit Factor: Gross Profit (600) / Gross Loss (100) = 6.0
assert.strictEqual(metrics.profitFactor, 6.0, 'Profit factor must be 6.0');
// Average Win: 600 / 2 = 300
assert.strictEqual(metrics.averageWin, 300, 'Average win must be 300');
// Average Loss: -100
assert.strictEqual(metrics.averageLoss, -100, 'Average loss must be -100');
// Expectancy: (0.50 * 300) + (0.25 * -100) = 150 - 25 = 125
assert.strictEqual(metrics.expectancy, 125, 'Expectancy must be 125');

console.log('✅ Test 4 Passed: Core and Advanced Trade Metrics calculated accurately!');
console.log('   Total PnL: $' + metrics.totalPnL);
console.log('   Win Rate: ' + metrics.winRate + '%');
console.log('   Profit Factor: ' + metrics.profitFactor);
console.log('   Expectancy: $' + metrics.expectancy + ' / trade');
console.log('   Max Drawdown: $' + metrics.maxDrawdown);

console.log('\n🎉 All backend test suites passed successfully!\n');
