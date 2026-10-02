import mongoose from 'mongoose';

const dailyPnLSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // Stored as 'YYYY-MM-DD' for exact calendar day indexing
      required: [true, 'Date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    profitLoss: {
      type: Number,
      required: [true, 'Profit/Loss amount is required'],
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index so user has exactly one daily PnL entry per date
dailyPnLSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('DailyPnL', dailyPnLSchema);
