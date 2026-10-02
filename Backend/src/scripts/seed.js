import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import Trade from '../models/Trade.js';
import DailyPnL from '../models/DailyPnL.js';

const seedData = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri || uri.includes('<db_username>')) {
      console.error('❌ Cannot run seed script: MONGODB_URI is not configured in .env');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('🌱 Connected to MongoDB for seeding demo data...');

    // 1. Create or retrieve demo trader user
    const demoEmail = 'demo@tradejournal.com';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      user = await User.create({
        name: 'Alex Rivera (Trader)',
        email: demoEmail,
        password: 'Password123!',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        preferences: {
          defaultCurrency: 'USD',
          defaultRiskReward: '1:2',
          theme: 'dark',
        },
      });
      console.log(`👤 Created Demo User: ${demoEmail} (Password: Password123!)`);
    } else {
      console.log(`👤 Found Existing Demo User: ${demoEmail}`);
    }

    // Clean up existing demo trades and daily PnL for this demo user
    await Trade.deleteMany({ userId: user._id });
    await DailyPnL.deleteMany({ userId: user._id });
    console.log('🧹 Cleaned existing trades for demo user.');

    // Sample Trades dataset
    const now = new Date();
    const getDateOffset = (daysAgo) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      return d;
    };

    const tradesData = [
      {
        userId: user._id,
        instrument: 'XAUUSD',
        direction: 'BUY',
        status: 'CLOSED',
        entryPrice: 2640.50,
        exitPrice: 2664.50,
        entryDate: getDateOffset(1),
        entryTime: '08:30',
        exitDate: getDateOffset(1),
        exitTime: '11:15',
        quantity: 0.20,
        stopLoss: 2628.50,
        takeProfit: 2664.50,
        riskRewardRatio: '1:2',
        profitLoss: 480.00,
        result: 'TP',
        session: 'London',
        notes: 'Clean liquidity sweep below previous day low during Asian session followed by strong bullish displacement.',
        tags: ['Liquidity', 'Breakout', 'London Session'],
      },
      {
        userId: user._id,
        instrument: 'EURUSD',
        direction: 'SELL',
        status: 'CLOSED',
        entryPrice: 1.0850,
        exitPrice: 1.0880,
        entryDate: getDateOffset(2),
        entryTime: '13:45',
        exitDate: getDateOffset(2),
        exitTime: '14:30',
        quantity: 1.00,
        stopLoss: 1.0880,
        takeProfit: 1.0790,
        riskRewardRatio: '1:2',
        profitLoss: -300.00,
        result: 'SL',
        session: 'New York',
        notes: 'CPI release spiked through resistance order block. Stopped out on spread expansion.',
        tags: ['News', 'Reversal'],
      },
      {
        userId: user._id,
        instrument: 'BTCUSD',
        direction: 'BUY',
        status: 'CLOSED',
        entryPrice: 65200.00,
        exitPrice: 67100.00,
        entryDate: getDateOffset(3),
        entryTime: '02:10',
        exitDate: getDateOffset(3),
        exitTime: '09:00',
        quantity: 0.15,
        stopLoss: 64250.00,
        takeProfit: 67100.00,
        riskRewardRatio: '1:2',
        profitLoss: 285.00,
        result: 'TP',
        session: 'Asian',
        notes: 'Bull flag breakout on 4H timeframe following institutional spot ETF inflows.',
        tags: ['Trend', 'Breakout'],
      },
      {
        userId: user._id,
        instrument: 'GBPUSD',
        direction: 'BUY',
        status: 'CLOSED',
        entryPrice: 1.3020,
        exitPrice: 1.3020,
        entryDate: getDateOffset(4),
        entryTime: '09:15',
        exitDate: getDateOffset(4),
        exitTime: '12:00',
        quantity: 0.50,
        stopLoss: 1.2980,
        takeProfit: 1.3100,
        riskRewardRatio: '1:2',
        profitLoss: 0.00,
        result: 'BE',
        session: 'London',
        notes: 'Price hit 1R, moved stop loss to breakeven. Reversed and closed out without loss.',
        tags: ['Support/Resistance', 'London Session'],
      },
      {
        userId: user._id,
        instrument: 'USDJPY',
        direction: 'SELL',
        status: 'CLOSED',
        entryPrice: 148.50,
        exitPrice: 147.10,
        entryDate: getDateOffset(6),
        entryTime: '07:00',
        exitDate: getDateOffset(6),
        exitTime: '15:20',
        quantity: 0.40,
        stopLoss: 149.20,
        takeProfit: 147.10,
        riskRewardRatio: '1:2',
        profitLoss: 375.00,
        result: 'TP',
        session: 'London + New York',
        notes: 'BOJ verbal intervention headline causing heavy dollar dumping across yen pairs.',
        tags: ['News', 'Trend'],
      },
      {
        userId: user._id,
        instrument: 'XAUUSD',
        direction: 'SELL',
        status: 'CLOSED',
        entryPrice: 2675.00,
        exitPrice: 2685.00,
        entryDate: getDateOffset(8),
        entryTime: '14:00',
        exitDate: getDateOffset(8),
        exitTime: '15:10',
        quantity: 0.10,
        stopLoss: 2685.00,
        takeProfit: 2655.00,
        riskRewardRatio: '1:2',
        profitLoss: -100.00,
        result: 'SL',
        session: 'New York',
        notes: 'Tried to fade all-time highs without waiting for 15M market structure shift. Premature entry.',
        tags: ['Scalping', 'Reversal'],
      },
      {
        userId: user._id,
        instrument: 'EURGBP',
        direction: 'BUY',
        status: 'CLOSED',
        entryPrice: 0.8340,
        exitPrice: 0.8385,
        entryDate: getDateOffset(10),
        entryTime: '10:00',
        exitDate: getDateOffset(10),
        exitTime: '16:00',
        quantity: 0.80,
        stopLoss: 0.8315,
        takeProfit: 0.8390,
        riskRewardRatio: '1:1.8',
        profitLoss: 215.00,
        result: 'Manual Exit',
        session: 'London',
        notes: 'Closed slightly before full TP ahead of central bank speech.',
        tags: ['Support/Resistance', 'Swing'],
      },
      {
        userId: user._id,
        instrument: 'USDCAD',
        direction: 'BUY',
        status: 'CLOSED',
        entryPrice: 1.3520,
        exitPrice: 1.3590,
        entryDate: getDateOffset(12),
        entryTime: '13:00',
        exitDate: getDateOffset(12),
        exitTime: '18:30',
        quantity: 0.60,
        stopLoss: 1.3485,
        takeProfit: 1.3590,
        riskRewardRatio: '1:2',
        profitLoss: 310.00,
        result: 'TP',
        session: 'New York',
        notes: 'WTI crude dropped sharply, providing natural lift to USDCAD off 50 EMA.',
        tags: ['Trend', 'Breakout'],
      },
      {
        userId: user._id,
        instrument: 'AUDUSD',
        direction: 'SELL',
        status: 'CLOSED',
        entryPrice: 0.6720,
        exitPrice: 0.6755,
        entryDate: getDateOffset(15),
        entryTime: '01:30',
        exitDate: getDateOffset(15),
        exitTime: '04:00',
        quantity: 0.50,
        stopLoss: 0.6755,
        takeProfit: 0.6650,
        riskRewardRatio: '1:2',
        profitLoss: -175.00,
        result: 'SL',
        session: 'Asian',
        notes: 'China stimulus expectations lifted Aussie across the board.',
        tags: ['News', 'Asian'],
      },
      {
        userId: user._id,
        instrument: 'XAUUSD',
        direction: 'BUY',
        status: 'CLOSED',
        entryPrice: 2610.00,
        exitPrice: 2635.00,
        entryDate: getDateOffset(18),
        entryTime: '09:00',
        exitDate: getDateOffset(18),
        exitTime: '13:30',
        quantity: 0.25,
        stopLoss: 2595.00,
        takeProfit: 2640.00,
        riskRewardRatio: '1:2',
        profitLoss: 625.00,
        result: 'TP',
        session: 'London',
        notes: 'Clean bounce off daily order block with high volume confirmation.',
        tags: ['Liquidity', 'London Session'],
      },
      {
        userId: user._id,
        instrument: 'GBPJPY',
        direction: 'BUY',
        status: 'OPEN',
        entryPrice: 194.20,
        exitPrice: null,
        entryDate: getDateOffset(0),
        entryTime: '10:00',
        exitDate: null,
        exitTime: '',
        quantity: 0.30,
        stopLoss: 193.40,
        takeProfit: 196.00,
        riskRewardRatio: '1:2.25',
        profitLoss: 0.00,
        result: 'Pending',
        session: 'London',
        notes: 'Currently holding swing long. Momentum holding above previous day high.',
        tags: ['Swing', 'Trend'],
      },
    ];

    await Trade.insertMany(tradesData);
    console.log(`✅ Seeded ${tradesData.length} demo trades.`);

    // Daily PnL entries for calendar verification
    const dailyData = [
      {
        userId: user._id,
        date: getDateOffset(1).toISOString().split('T')[0],
        profitLoss: 480.00,
        notes: 'Strong gold performance, reached TP smoothly.',
      },
      {
        userId: user._id,
        date: getDateOffset(2).toISOString().split('T')[0],
        profitLoss: -300.00,
        notes: 'CPI volatility hit stop loss. Managed risk properly.',
      },
      {
        userId: user._id,
        date: getDateOffset(3).toISOString().split('T')[0],
        profitLoss: 285.00,
        notes: 'Bitcoin run continued nicely overnight.',
      },
      {
        userId: user._id,
        date: getDateOffset(4).toISOString().split('T')[0],
        profitLoss: 0.00,
        notes: 'Breakeven day, no capital lost.',
      },
    ];

    await DailyPnL.insertMany(dailyData);
    console.log(`✅ Seeded ${dailyData.length} daily PnL records.`);

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedData();
