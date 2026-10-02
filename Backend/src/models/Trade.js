import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    instrument: {
      type: String,
      required: [true, 'Instrument is required'],
      trim: true,
      uppercase: true,
    },
    customInstrument: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    direction: {
      type: String,
      enum: ['BUY', 'SELL'],
      required: [true, 'Direction (BUY or SELL) is required'],
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED'],
      default: 'CLOSED',
    },
    entryPrice: {
      type: Number,
      required: [true, 'Entry price is required'],
    },
    exitPrice: {
      type: Number,
      default: null,
    },
    entryDate: {
      type: Date,
      required: [true, 'Entry date is required'],
      default: Date.now,
    },
    entryTime: {
      type: String,
      default: '00:00',
    },
    exitDate: {
      type: Date,
      default: null,
    },
    exitTime: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity/Lot size is required'],
      min: [0.0001, 'Quantity must be greater than 0'],
    },
    stopLoss: {
      type: Number,
      default: null,
    },
    takeProfit: {
      type: Number,
      default: null,
    },
    riskRewardRatio: {
      type: String,
      default: '1:2',
      match: [/^1:[0-9]+(\.[0-9]+)?$/, 'Risk-to-Reward Ratio must be in ratio format, e.g. 1:2 or 1:1.5'],
    },
    profitLoss: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    result: {
      type: String,
      enum: ['TP', 'SL', 'BE', 'Manual Exit', 'Pending'],
      default: 'Pending',
    },
    beforeTradeImage: {
      type: String,
      default: '',
    },
    afterTradeImage: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    session: {
      type: String,
      enum: ['Asian', 'London', 'New York', 'London + New York', 'Other', ''],
      default: 'London',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high performance queries
tradeSchema.index({ userId: 1, entryDate: -1 });
tradeSchema.index({ userId: 1, instrument: 1 });
tradeSchema.index({ userId: 1, result: 1 });
tradeSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Trade', tradeSchema);
