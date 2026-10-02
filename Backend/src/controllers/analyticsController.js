import Trade from '../models/Trade.js';
import { calculateTradeMetrics } from '../utils/calculations.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const { range = 'all', startDate, endDate } = req.query;

    const query = { userId: req.user._id };

    const now = new Date();

    if (range === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      query.entryDate = { $gte: start, $lte: end };
    } else if (range === 'week') {
      // Start of current week (Monday)
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      query.entryDate = { $gte: start };
    } else if (range === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      query.entryDate = { $gte: start };
    } else if (range === 'last_month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      query.entryDate = { $gte: start, $lte: end };
    } else if (range === '3_months') {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      query.entryDate = { $gte: start };
    } else if (range === 'year') {
      const start = new Date(now.getFullYear(), 0, 1);
      query.entryDate = { $gte: start };
    } else if (range === 'custom' && (startDate || endDate)) {
      query.entryDate = {};
      if (startDate) query.entryDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.entryDate.$lte = end;
      }
    }

    // Fetch filtered trades
    const trades = await Trade.find(query).sort({ entryDate: -1 }).lean();

    // Calculate core metrics
    const metrics = calculateTradeMetrics(trades);

    // Instrument breakdown
    const instrumentMap = {};
    trades.forEach((trade) => {
      const inst = trade.instrument || 'OTHER';
      if (!instrumentMap[inst]) {
        instrumentMap[inst] = {
          instrument: inst,
          trades: 0,
          wins: 0,
          pnl: 0,
          bestTrade: -Infinity,
          worstTrade: Infinity,
        };
      }
      instrumentMap[inst].trades += 1;
      const pnl = Number(trade.profitLoss || 0);
      instrumentMap[inst].pnl += pnl;
      if (pnl > 0 || trade.result === 'TP') instrumentMap[inst].wins += 1;
      if (pnl > instrumentMap[inst].bestTrade) instrumentMap[inst].bestTrade = pnl;
      if (pnl < instrumentMap[inst].worstTrade) instrumentMap[inst].worstTrade = pnl;
    });

    const instrumentAnalysis = Object.values(instrumentMap).map((item) => ({
      instrument: item.instrument,
      trades: item.trades,
      winRate: Number(((item.wins / item.trades) * 100).toFixed(1)),
      totalPnL: Number(item.pnl.toFixed(2)),
      averagePnL: Number((item.pnl / item.trades).toFixed(2)),
      bestTrade: item.bestTrade === -Infinity ? 0 : Number(item.bestTrade.toFixed(2)),
      worstTrade: item.worstTrade === Infinity ? 0 : Number(item.worstTrade.toFixed(2)),
    }));

    // Session breakdown
    const sessions = ['Asian', 'London', 'New York', 'London + New York', 'Other'];
    const sessionMap = {};
    sessions.forEach((s) => {
      sessionMap[s] = { session: s, trades: 0, wins: 0, pnl: 0 };
    });

    trades.forEach((trade) => {
      const sess = sessions.includes(trade.session) ? trade.session : 'Other';
      sessionMap[sess].trades += 1;
      const pnl = Number(trade.profitLoss || 0);
      sessionMap[sess].pnl += pnl;
      if (pnl > 0 || trade.result === 'TP') sessionMap[sess].wins += 1;
    });

    const sessionAnalysis = Object.values(sessionMap).map((s) => ({
      session: s.session,
      trades: s.trades,
      winRate: s.trades > 0 ? Number(((s.wins / s.trades) * 100).toFixed(1)) : 0,
      totalPnL: Number(s.pnl.toFixed(2)),
      averagePnL: s.trades > 0 ? Number((s.pnl / s.trades).toFixed(2)) : 0,
    }));

    // Result breakdown (TP, SL, BE, Manual Exit)
    const results = ['TP', 'SL', 'BE', 'Manual Exit'];
    const resultMap = {};
    results.forEach((r) => {
      resultMap[r] = { result: r, count: 0, pnl: 0 };
    });

    trades.forEach((trade) => {
      if (trade.result && resultMap[trade.result]) {
        resultMap[trade.result].count += 1;
        resultMap[trade.result].pnl += Number(trade.profitLoss || 0);
      }
    });

    const totalResultsCount = trades.length || 1;
    const resultAnalysis = Object.values(resultMap).map((r) => ({
      result: r.result,
      count: r.count,
      percentage: Number(((r.count / totalResultsCount) * 100).toFixed(1)),
      totalPnL: Number(r.pnl.toFixed(2)),
    }));

    // Today's summary
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTrades = trades.filter((t) => new Date(t.entryDate) >= todayStart);
    const todayPnL = todayTrades.reduce((acc, t) => acc + Number(t.profitLoss || 0), 0);
    const todayWins = todayTrades.filter((t) => Number(t.profitLoss || 0) > 0 || t.result === 'TP').length;
    const todayWinRate = todayTrades.length > 0 ? Number(((todayWins / todayTrades.length) * 100).toFixed(1)) : 0;

    // Recent trades (latest 8)
    const recentTrades = trades.slice(0, 8).map((t) => ({
      _id: t._id,
      instrument: t.instrument,
      direction: t.direction,
      entryDate: t.entryDate,
      entryPrice: t.entryPrice,
      exitPrice: t.exitPrice,
      quantity: t.quantity,
      riskRewardRatio: t.riskRewardRatio,
      profitLoss: t.profitLoss,
      result: t.result,
      status: t.status,
    }));

    res.status(200).json({
      success: true,
      data: {
        range,
        metrics,
        todaySummary: {
          pnl: Number(todayPnL.toFixed(2)),
          trades: todayTrades.length,
          winRate: todayWinRate,
        },
        instrumentAnalysis,
        sessionAnalysis,
        resultAnalysis,
        recentTrades,
      },
    });
  } catch (error) {
    next(error);
  }
};
