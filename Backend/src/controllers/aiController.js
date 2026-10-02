import Trade from '../models/Trade.js';
import { aiManager } from '../services/ai/aiManager.js';
import { calculateTradeMetrics } from '../utils/calculations.js';

export const analyzeTradeById = async (req, res, next) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found',
      });
    }

    const analysis = await aiManager.analyzeTrade(trade);

    // Save persistent AI analysis to trade record
    trade.aiAnalysis = {
      setupQualityScore: analysis.setupQualityScore,
      summary: analysis.summary,
      strengths: analysis.strengths,
      risksOrMistakes: analysis.risksOrMistakes,
      recommendations: analysis.recommendations,
      chartObservations: analysis.chartObservations,
      providerUsed: analysis.providerUsed,
      analyzedAt: new Date(),
    };

    await trade.save();

    res.status(200).json({
      success: true,
      message: 'AI trade analysis completed successfully',
      data: trade.aiAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

export const generateNotes = async (req, res, next) => {
  try {
    const notes = await aiManager.generateNotes(req.body);
    res.status(200).json({
      success: true,
      data: { notes },
    });
  } catch (error) {
    next(error);
  }
};

export const chatWithCoach = async (req, res, next) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A messages array is required for AI Trading Coach.',
      });
    }

    // Retrieve user's actual trade history to furnish rich quantitative context
    const userTrades = await Trade.find({ userId: req.user._id }).lean();
    const metrics = calculateTradeMetrics(userTrades);

    const context = {
      totalTrades: metrics.totalTrades,
      winRate: metrics.winRate,
      totalPnL: metrics.totalPnL,
      profitFactor: metrics.profitFactor,
      maxDrawdown: metrics.maxDrawdown,
      bestWinningStreak: metrics.bestWinningStreak,
    };

    const reply = await aiManager.chatWithCoach(messages, context);

    res.status(200).json({
      success: true,
      data: { reply, context },
    });
  } catch (error) {
    next(error);
  }
};

export const getStatus = (req, res) => {
  const status = aiManager.getStatus();
  res.status(200).json({
    success: true,
    data: status,
  });
};
