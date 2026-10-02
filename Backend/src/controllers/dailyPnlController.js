import DailyPnL from '../models/DailyPnL.js';
import Trade from '../models/Trade.js';

export const saveDailyPnL = async (req, res, next) => {
  try {
    const { date, profitLoss, notes } = req.body;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'A valid date formatted as YYYY-MM-DD is required.',
      });
    }

    if (profitLoss === undefined || profitLoss === null || isNaN(Number(profitLoss))) {
      return res.status(400).json({
        success: false,
        message: 'A numeric profit/loss amount is required.',
      });
    }

    // Upsert record for the unique userId + date pair
    const record = await DailyPnL.findOneAndUpdate(
      { userId: req.user._id, date },
      {
        userId: req.user._id,
        date,
        profitLoss: Number(profitLoss),
        notes: notes || '',
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Daily P/L saved successfully',
      data: { dailyPnL: record },
    });
  } catch (error) {
    next(error);
  }
};

export const getCalendarData = async (req, res, next) => {
  try {
    const { month } = req.query; // Format: 'YYYY-MM', e.g. '2026-10'

    let startDate, endDate;
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, m] = month.split('-').map(Number);
      startDate = new Date(year, m - 1, 1);
      endDate = new Date(year, m, 0, 23, 59, 59, 999);
    } else {
      // Default to current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // 1. Fetch manual Daily PnL records
    const manualRecords = await DailyPnL.find({
      userId: req.user._id,
      date: { $gte: startStr, $lte: endStr },
    }).lean();

    // 2. Fetch realized Trades in this date range
    const trades = await Trade.find({
      userId: req.user._id,
      entryDate: { $gte: startDate, $lte: endDate },
    }).lean();

    // 3. Build daily aggregated map
    const calendarMap = {};

    // Group trades by date
    trades.forEach((trade) => {
      const dateStr = new Date(trade.entryDate).toISOString().split('T')[0];
      if (!calendarMap[dateStr]) {
        calendarMap[dateStr] = {
          date: dateStr,
          tradePnL: 0,
          manualPnL: null,
          manualNotes: '',
          hasManual: false,
          tradesCount: 0,
          winningCount: 0,
          losingCount: 0,
          breakEvenCount: 0,
          trades: [],
        };
      }
      calendarMap[dateStr].tradesCount += 1;
      const pnl = Number(trade.profitLoss || 0);
      calendarMap[dateStr].tradePnL = Number((calendarMap[dateStr].tradePnL + pnl).toFixed(2));
      if (pnl > 0 || trade.result === 'TP') calendarMap[dateStr].winningCount += 1;
      else if (pnl < 0 || trade.result === 'SL') calendarMap[dateStr].losingCount += 1;
      else calendarMap[dateStr].breakEvenCount += 1;

      calendarMap[dateStr].trades.push({
        _id: trade._id,
        instrument: trade.instrument,
        direction: trade.direction,
        profitLoss: trade.profitLoss,
        result: trade.result,
        quantity: trade.quantity,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        riskRewardRatio: trade.riskRewardRatio,
      });
    });

    // Merge manual Daily PnL records
    manualRecords.forEach((rec) => {
      const dateStr = rec.date;
      if (!calendarMap[dateStr]) {
        calendarMap[dateStr] = {
          date: dateStr,
          tradePnL: 0,
          manualPnL: Number(rec.profitLoss),
          manualNotes: rec.notes || '',
          hasManual: true,
          tradesCount: 0,
          winningCount: 0,
          losingCount: 0,
          breakEvenCount: 0,
          trades: [],
        };
      } else {
        calendarMap[dateStr].manualPnL = Number(rec.profitLoss);
        calendarMap[dateStr].manualNotes = rec.notes || '';
        calendarMap[dateStr].hasManual = true;
      }
    });

    // Calculate effective PnL for each day:
    // If manual is set, effective PnL is manualPnL (representing user's final daily reconciliation)
    // Otherwise, effective PnL is the aggregated tradePnL
    const days = Object.values(calendarMap).map((day) => {
      const effectivePnL = day.hasManual ? day.manualPnL : day.tradesCount > 0 ? day.tradePnL : null;
      return {
        ...day,
        effectivePnL,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        month: month || startStr.substring(0, 7),
        days,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDailyPnL = async (req, res, next) => {
  try {
    const { date } = req.params;
    const deleted = await DailyPnL.findOneAndDelete({
      userId: req.user._id,
      date,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Daily P/L entry not found for this date.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Daily P/L entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
