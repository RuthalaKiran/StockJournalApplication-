/**
 * Calculate Risk-to-Reward Ratio from price levels.
 * Returns string in '1:X' format (e.g. '1:2', '1:1.5') or null if invalid.
 */
export const calculateRiskReward = (direction, entryPrice, stopLoss, takeProfit) => {
  const entry = Number(entryPrice);
  const sl = Number(stopLoss);
  const tp = Number(takeProfit);

  if (!entry || !sl || !tp) return null;

  let risk = 0;
  let reward = 0;

  if (direction === 'BUY') {
    risk = entry - sl;
    reward = tp - entry;
  } else if (direction === 'SELL') {
    risk = sl - entry;
    reward = entry - tp;
  }

  if (risk <= 0 || reward <= 0) return null;

  const ratio = reward / risk;
  // Format to 1 decimal place if needed, or integer if whole
  const rounded = Number(ratio.toFixed(2));
  return `1:${rounded}`;
};

/**
 * Calculates trading statistics and performance metrics for a list of trades.
 */
export const calculateTradeMetrics = (trades = []) => {
  // Only consider closed trades with a defined result and profitLoss
  const closedTrades = trades.filter(
    (t) => t.status === 'CLOSED' || (t.result && t.result !== 'Pending')
  );

  const totalTrades = closedTrades.length;
  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      totalPnL: 0,
      winRate: 0,
      lossRate: 0,
      breakEvenRate: 0,
      profitFactor: null,
      averageWin: 0,
      averageLoss: 0,
      bestTrade: 0,
      worstTrade: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakEvenTrades: 0,
      expectancy: 0,
      maxDrawdown: 0,
      averageTradePnL: 0,
      currentStreak: { type: 'NONE', count: 0 },
      bestWinningStreak: 0,
      equityCurve: [],
      dailyPnL: [],
      buyPerformance: { trades: 0, winRate: 0, pnl: 0 },
      sellPerformance: { trades: 0, winRate: 0, pnl: 0 },
    };
  }

  let totalPnL = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let breakEvenTrades = 0;
  let bestTrade = -Infinity;
  let worstTrade = Infinity;

  let buyTrades = 0;
  let buyWins = 0;
  let buyPnL = 0;

  let sellTrades = 0;
  let sellWins = 0;
  let sellPnL = 0;

  // Sort chronologically for equity curve and streak calculations
  const sortedTrades = [...closedTrades].sort(
    (a, b) => new Date(a.entryDate || a.createdAt) - new Date(b.entryDate || b.createdAt)
  );

  // Streaks
  let currentStreakCount = 0;
  let currentStreakType = 'NONE'; // 'WIN' or 'LOSS'
  let bestWinningStreak = 0;
  let tempWinStreak = 0;

  // Equity curve tracking
  let cumulativeEquity = 0;
  let peakEquity = 0;
  let maxDrawdown = 0;
  const equityCurve = [];
  const dailyPnLMap = {};

  sortedTrades.forEach((trade, index) => {
    const pnl = Number(trade.profitLoss || 0);
    totalPnL += pnl;

    if (pnl > bestTrade) bestTrade = pnl;
    if (pnl < worstTrade) worstTrade = pnl;

    if (pnl > 0 || trade.result === 'TP') {
      winningTrades++;
      grossProfit += pnl;
      tempWinStreak++;
      if (tempWinStreak > bestWinningStreak) {
        bestWinningStreak = tempWinStreak;
      }
      if (currentStreakType === 'WIN') {
        currentStreakCount++;
      } else {
        currentStreakType = 'WIN';
        currentStreakCount = 1;
      }
    } else if (pnl < 0 || trade.result === 'SL') {
      losingTrades++;
      grossLoss += Math.abs(pnl);
      tempWinStreak = 0;
      if (currentStreakType === 'LOSS') {
        currentStreakCount++;
      } else {
        currentStreakType = 'LOSS';
        currentStreakCount = 1;
      }
    } else {
      breakEvenTrades++;
      tempWinStreak = 0;
      // BE doesn't change win/loss streak
    }

    // Direction tracking
    if (trade.direction === 'BUY') {
      buyTrades++;
      buyPnL += pnl;
      if (pnl > 0 || trade.result === 'TP') buyWins++;
    } else if (trade.direction === 'SELL') {
      sellTrades++;
      sellPnL += pnl;
      if (pnl > 0 || trade.result === 'TP') sellWins++;
    }

    // Equity curve point
    cumulativeEquity += pnl;
    if (cumulativeEquity > peakEquity) {
      peakEquity = cumulativeEquity;
    }
    const currentDrawdown = peakEquity - cumulativeEquity;
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
    }

    const tradeDateStr = new Date(trade.entryDate || trade.createdAt).toISOString().split('T')[0];
    equityCurve.push({
      tradeIndex: index + 1,
      date: tradeDateStr,
      instrument: trade.instrument,
      pnl: Number(pnl.toFixed(2)),
      cumulativePnL: Number(cumulativeEquity.toFixed(2)),
    });

    // Daily PnL accumulation
    if (!dailyPnLMap[tradeDateStr]) {
      dailyPnLMap[tradeDateStr] = { date: tradeDateStr, pnl: 0, count: 0 };
    }
    dailyPnLMap[tradeDateStr].pnl += pnl;
    dailyPnLMap[tradeDateStr].count += 1;
  });

  // Rates
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const lossRate = totalTrades > 0 ? (losingTrades / totalTrades) * 100 : 0;
  const breakEvenRate = totalTrades > 0 ? (breakEvenTrades / totalTrades) * 100 : 0;

  // Averages
  const averageWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
  const averageLoss = losingTrades > 0 ? -(grossLoss / losingTrades) : 0; // negative representation
  const averageTradePnL = totalTrades > 0 ? totalPnL / totalTrades : 0;

  // Profit Factor
  const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : null;

  // Expectancy = (Win Rate * Avg Win) + (Loss Rate * Avg Loss)
  // Notice winRate and lossRate are decimals here
  const winRateDec = winRate / 100;
  const lossRateDec = lossRate / 100;
  const expectancy = winRateDec * averageWin + lossRateDec * averageLoss;

  const dailyPnL = Object.values(dailyPnLMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({
      ...item,
      pnl: Number(item.pnl.toFixed(2)),
    }));

  return {
    totalTrades,
    totalPnL: Number(totalPnL.toFixed(2)),
    winRate: Number(winRate.toFixed(1)),
    lossRate: Number(lossRate.toFixed(1)),
    breakEvenRate: Number(breakEvenRate.toFixed(1)),
    profitFactor,
    averageWin: Number(averageWin.toFixed(2)),
    averageLoss: Number(averageLoss.toFixed(2)),
    bestTrade: bestTrade === -Infinity ? 0 : Number(bestTrade.toFixed(2)),
    worstTrade: worstTrade === Infinity ? 0 : Number(worstTrade.toFixed(2)),
    winningTrades,
    losingTrades,
    breakEvenTrades,
    expectancy: Number(expectancy.toFixed(2)),
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    averageTradePnL: Number(averageTradePnL.toFixed(2)),
    currentStreak: { type: currentStreakType, count: currentStreakCount },
    bestWinningStreak,
    equityCurve,
    dailyPnL,
    buyPerformance: {
      trades: buyTrades,
      winRate: buyTrades > 0 ? Number(((buyWins / buyTrades) * 100).toFixed(1)) : 0,
      pnl: Number(buyPnL.toFixed(2)),
    },
    sellPerformance: {
      trades: sellTrades,
      winRate: sellTrades > 0 ? Number(((sellWins / sellTrades) * 100).toFixed(1)) : 0,
      pnl: Number(sellPnL.toFixed(2)),
    },
  };
};
