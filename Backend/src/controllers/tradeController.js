import Trade from '../models/Trade.js';
import { calculateRiskReward } from '../utils/calculations.js';

export const createTrade = async (req, res, next) => {
  try {
    const {
      instrument,
      customInstrument,
      direction,
      status = 'CLOSED',
      entryPrice,
      exitPrice,
      entryDate,
      entryTime,
      exitDate,
      exitTime,
      quantity,
      stopLoss,
      takeProfit,
      riskRewardRatio,
      profitLoss,
      currency = 'USD',
      result,
      beforeTradeImage,
      afterTradeImage,
      notes,
      tags,
      session,
    } = req.body;

    // Basic Validation
    if (!instrument) {
      return res.status(400).json({ success: false, message: 'Trading instrument is required.' });
    }
    if (!direction || !['BUY', 'SELL'].includes(direction)) {
      return res.status(400).json({ success: false, message: 'Valid direction (BUY or SELL) is required.' });
    }
    if (entryPrice === undefined || entryPrice === null || isNaN(Number(entryPrice))) {
      return res.status(400).json({ success: false, message: 'Valid entry price is required.' });
    }
    if (quantity === undefined || quantity === null || Number(quantity) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid quantity/lot size (> 0) is required.' });
    }

    // Validation for Closed Trades
    if (status === 'CLOSED') {
      if (exitPrice === undefined || exitPrice === null || isNaN(Number(exitPrice))) {
        return res.status(400).json({ success: false, message: 'Exit price is required for closed trades.' });
      }
      if (!result) {
        return res.status(400).json({ success: false, message: 'Result (TP, SL, BE, Manual Exit) is required for closed trades.' });
      }
      if (profitLoss === undefined || profitLoss === null || isNaN(Number(profitLoss))) {
        return res.status(400).json({ success: false, message: 'Profit/Loss amount is required for closed trades.' });
      }
    }

    // Handle Risk-to-Reward ratio
    let finalRR = riskRewardRatio;
    if (!finalRR && stopLoss && takeProfit) {
      finalRR = calculateRiskReward(direction, entryPrice, stopLoss, takeProfit) || '1:2';
    } else if (!finalRR) {
      finalRR = '1:2';
    }

    // Strict user isolation
    const trade = await Trade.create({
      userId: req.user._id,
      instrument: instrument.trim().toUpperCase(),
      customInstrument: customInstrument ? customInstrument.trim().toUpperCase() : '',
      direction,
      status,
      entryPrice: Number(entryPrice),
      exitPrice: exitPrice !== undefined && exitPrice !== null ? Number(exitPrice) : null,
      entryDate: entryDate ? new Date(entryDate) : new Date(),
      entryTime: entryTime || '00:00',
      exitDate: exitDate ? new Date(exitDate) : null,
      exitTime: exitTime || '',
      quantity: Number(quantity),
      stopLoss: stopLoss !== undefined && stopLoss !== null ? Number(stopLoss) : null,
      takeProfit: takeProfit !== undefined && takeProfit !== null ? Number(takeProfit) : null,
      riskRewardRatio: finalRR,
      profitLoss: profitLoss !== undefined && profitLoss !== null ? Number(profitLoss) : 0,
      currency: currency.toUpperCase(),
      result: status === 'OPEN' ? 'Pending' : result,
      beforeTradeImage: beforeTradeImage || '',
      afterTradeImage: afterTradeImage || '',
      notes: notes || '',
      tags: Array.isArray(tags) ? tags : [],
      session: session || 'London',
    });

    res.status(201).json({
      success: true,
      message: 'Trade recorded successfully',
      data: { trade },
    });
  } catch (error) {
    next(error);
  }
};

export const getTrades = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      instrument,
      direction,
      result,
      status,
      startDate,
      endDate,
      sortBy = 'entryDate',
      sortOrder = 'desc',
    } = req.query;

    // Strict user isolation query
    const query = { userId: req.user._id };

    if (instrument) {
      query.instrument = instrument.toUpperCase();
    }

    if (direction && ['BUY', 'SELL'].includes(direction)) {
      query.direction = direction;
    }

    if (result) {
      query.result = result;
    }

    if (status && ['OPEN', 'CLOSED'].includes(status)) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.entryDate = {};
      if (startDate) {
        query.entryDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.entryDate.$lte = end;
      }
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { instrument: searchRegex },
        { customInstrument: searchRegex },
        { notes: searchRegex },
        { tags: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [trades, total] = await Promise.all([
      Trade.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
      Trade.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        trades,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum) || 1,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTradeById = async (req, res, next) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      userId: req.user._id, // Strict ownership check
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found or unauthorized to view.',
      });
    }

    res.status(200).json({
      success: true,
      data: { trade },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      userId: req.user._id, // Strict ownership check
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found or unauthorized to edit.',
      });
    }

    const {
      instrument,
      customInstrument,
      direction,
      status,
      entryPrice,
      exitPrice,
      entryDate,
      entryTime,
      exitDate,
      exitTime,
      quantity,
      stopLoss,
      takeProfit,
      riskRewardRatio,
      profitLoss,
      currency,
      result,
      beforeTradeImage,
      afterTradeImage,
      notes,
      tags,
      session,
    } = req.body;

    if (instrument) trade.instrument = instrument.trim().toUpperCase();
    if (customInstrument !== undefined) trade.customInstrument = customInstrument.trim().toUpperCase();
    if (direction) trade.direction = direction;
    if (status) trade.status = status;
    if (entryPrice !== undefined) trade.entryPrice = Number(entryPrice);
    if (exitPrice !== undefined) trade.exitPrice = exitPrice !== null ? Number(exitPrice) : null;
    if (entryDate) trade.entryDate = new Date(entryDate);
    if (entryTime !== undefined) trade.entryTime = entryTime;
    if (exitDate !== undefined) trade.exitDate = exitDate ? new Date(exitDate) : null;
    if (exitTime !== undefined) trade.exitTime = exitTime;
    if (quantity !== undefined) trade.quantity = Number(quantity);
    if (stopLoss !== undefined) trade.stopLoss = stopLoss !== null ? Number(stopLoss) : null;
    if (takeProfit !== undefined) trade.takeProfit = takeProfit !== null ? Number(takeProfit) : null;
    if (riskRewardRatio) trade.riskRewardRatio = riskRewardRatio;
    if (profitLoss !== undefined) trade.profitLoss = Number(profitLoss);
    if (currency) trade.currency = currency.toUpperCase();
    if (result) trade.result = result;
    if (beforeTradeImage !== undefined) trade.beforeTradeImage = beforeTradeImage;
    if (afterTradeImage !== undefined) trade.afterTradeImage = afterTradeImage;
    if (notes !== undefined) trade.notes = notes;
    if (tags !== undefined) trade.tags = Array.isArray(tags) ? tags : [];
    if (session !== undefined) trade.session = session;

    await trade.save();

    res.status(200).json({
      success: true,
      message: 'Trade updated successfully',
      data: { trade },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id, // Strict ownership check
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found or unauthorized to delete.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Trade deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
