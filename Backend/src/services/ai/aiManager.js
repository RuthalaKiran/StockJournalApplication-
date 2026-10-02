import { GeminiProvider } from './providers/geminiProvider.js';
import { GroqProvider } from './providers/groqProvider.js';

export class AIManager {
  constructor() {
    this.gemini = new GeminiProvider();
    this.groq = new GroqProvider();
  }

  getStatus() {
    const geminiAvailable = this.gemini.isAvailable();
    const groqAvailable = this.groq.isAvailable();

    return {
      geminiAvailable,
      groqAvailable,
      primaryProvider: geminiAvailable ? 'gemini (vision+text)' : groqAvailable ? 'groq (text-only)' : 'mock',
      fallbackProvider: geminiAvailable && groqAvailable ? 'groq' : null,
    };
  }

  /**
   * Smart deterministic heuristic fallback when no AI keys are configured or both external APIs fail
   */
  generateHeuristicAnalysis(trade, fallbackReason = '') {
    const isWin = trade.profitLoss > 0;
    const isSL = trade.result === 'SL';
    const isTP = trade.result === 'TP';
    const rrRatio = trade.riskRewardRatio || '1:2';
    const numRR = parseFloat(rrRatio.replace('1:', '')) || 2.0;

    let score = isWin ? Math.min(9, Math.round(6 + numRR)) : Math.max(4, Math.round(7 - (isSL ? 2 : 1)));
    if (!trade.stopLoss) score = Math.max(2, score - 3);

    return {
      setupQualityScore: score,
      summary: `Trade executed on ${trade.instrument} (${trade.direction}) during the ${trade.session || 'London'} session, yielding ${
        isWin ? `a profit of +$${trade.profitLoss}` : trade.profitLoss < 0 ? `a loss of -$${Math.abs(trade.profitLoss)}` : 'a break-even outcome'
      }. Risk-to-reward planned at ${rrRatio}.`,
      chartObservations: trade.beforeTradeImage || trade.afterTradeImage
        ? `Chart screenshots captured for ${trade.instrument}. Key levels respected around ${trade.entryPrice} with Stop Loss at ${
            trade.stopLoss || 'unspecified'
          } and Take Profit at ${trade.takeProfit || 'unspecified'}.`
        : `Execution focused on ${trade.direction} momentum at ${trade.entryPrice}. (Note: Upload before/after screenshots for visual chart structure audit).`,
      strengths: [
        trade.stopLoss ? `Defined risk management with explicit Stop Loss at ${trade.stopLoss}` : 'Execution logged in real-time',
        numRR >= 1.5 ? `Favorable planned Risk-to-Reward ratio (${rrRatio})` : 'Position sized appropriately for session liquidity',
        trade.notes ? `Clear rationale documented: "${trade.notes.slice(0, 60)}..."` : 'Aligned with session volatility',
      ],
      risksOrMistakes: [
        !trade.stopLoss ? 'CRITICAL: No Stop Loss recorded. Never trade without defined invalidation.' : 'Ensure partial profit taking at key liquidity pools',
        numRR < 1.5 ? `Planned R:R (${rrRatio}) is below recommended 1:1.5 minimum threshold.` : 'Monitor slippage and spread widening around news releases',
      ],
      recommendations: [
        'Always verify higher-timeframe confluence before executing counter-trend setups.',
        'Review the trade screenshot to audit whether exit timing matched the planned target.',
        'Continue journaling every trade to track statistical edge across sessions.',
      ],
      providerUsed: fallbackReason
        ? `heuristic fallback (${fallbackReason})`
        : 'heuristic fallback (Add GEMINI_API_KEY in .env for live Vision analysis)',
    };
  }

  /**
   * Router Method: Analyze Trade with Gemini Vision -> Fallback to Groq Text -> Fallback to Heuristic
   */
  async analyzeTrade(trade) {
    // 1. Try Primary: Gemini (Vision + Text)
    if (this.gemini.isAvailable()) {
      try {
        console.log(`🤖 [AI Router] Sending trade ${trade._id} to Gemini (Vision + Text)...`);
        const result = await this.gemini.analyzeTrade(trade);
        return {
          ...result,
          providerUsed: 'gemini (vision+text)',
          fallbackOccurred: false,
          analyzedAt: new Date(),
        };
      } catch (geminiError) {
        console.warn(`⚠️  [AI Router] Gemini failed (${geminiError.message}). Routing to Groq fallback...`);

        // 2. Try Fallback: Groq (Text)
        if (this.groq.isAvailable()) {
          try {
            console.log(`⚡ [AI Router] Executing fallback on Groq for trade ${trade._id}...`);
            const groqResult = await this.groq.analyzeTrade(trade);
            return {
              ...groqResult,
              providerUsed: 'groq (fallback)',
              fallbackOccurred: true,
              fallbackReason: `Gemini error: ${geminiError.message}`,
              analyzedAt: new Date(),
            };
          } catch (groqError) {
            console.error(`❌ [AI Router] Groq fallback also failed (${groqError.message}).`);
            return this.generateHeuristicAnalysis(trade, `Gemini & Groq failed: ${geminiError.message}`);
          }
        } else {
          return this.generateHeuristicAnalysis(trade, `Gemini failed: ${geminiError.message}; Groq key missing`);
        }
      }
    }

    // 2. If Gemini not configured, try Groq directly
    if (this.groq.isAvailable()) {
      try {
        console.log(`⚡ [AI Router] Gemini not configured. Routing directly to Groq (Text) for trade ${trade._id}...`);
        const groqResult = await this.groq.analyzeTrade(trade);
        return {
          ...groqResult,
          providerUsed: 'groq (text-only)',
          fallbackOccurred: false,
          analyzedAt: new Date(),
        };
      } catch (groqError) {
        console.error(`❌ [AI Router] Groq analysis failed (${groqError.message}).`);
        return this.generateHeuristicAnalysis(trade, `Groq failed: ${groqError.message}`);
      }
    }

    // 3. Fallback when neither key is configured
    console.log('💡 [AI Router] No external AI keys configured. Using smart heuristic analyzer.');
    return this.generateHeuristicAnalysis(trade);
  }

  /**
   * Router Method: Auto-Draft Journal Notes
   */
  async generateNotes(tradeData) {
    if (this.gemini.isAvailable()) {
      try {
        return await this.gemini.generateNotes(tradeData);
      } catch (err) {
        console.warn(`[AI Router] Gemini notes failed (${err.message}). Trying Groq...`);
        if (this.groq.isAvailable()) {
          try {
            return await this.groq.generateNotes(tradeData);
          } catch (gErr) {
            console.error(`[AI Router] Groq notes failed (${gErr.message})`);
          }
        }
      }
    } else if (this.groq.isAvailable()) {
      try {
        return await this.groq.generateNotes(tradeData);
      } catch (gErr) {
        console.error(`[AI Router] Groq notes failed (${gErr.message})`);
      }
    }

    // Heuristic template fallback
    return `- Rationale: Anticipated ${tradeData.direction} continuation on ${tradeData.instrument} around ${tradeData.entryPrice} during ${
      tradeData.session || 'London'
    } session.\n- Confluence: Key price rejection level aligned with planned invalidation at ${
      tradeData.stopLoss || 'recent structural high/low'
    }.\n- Management: Targeting ${tradeData.riskRewardRatio || '1:2'} R:R. Shift Stop Loss to Break-Even after 1R gain.`;
  }

  /**
   * Router Method: Chat with AI Trading Coach
   */
  async chatWithCoach(messages, context = {}) {
    if (this.gemini.isAvailable()) {
      try {
        return await this.gemini.chatWithCoach(messages, context);
      } catch (err) {
        console.warn(`[AI Router] Gemini coach chat failed (${err.message}). Trying Groq...`);
        if (this.groq.isAvailable()) {
          try {
            return await this.groq.chatWithCoach(messages, context);
          } catch (gErr) {
            console.error(`[AI Router] Groq coach chat failed (${gErr.message})`);
          }
        }
      }
    } else if (this.groq.isAvailable()) {
      try {
        return await this.groq.chatWithCoach(messages, context);
      } catch (gErr) {
        console.error(`[AI Router] Groq coach chat failed (${gErr.message})`);
      }
    }

    // Heuristic coach reply
    return `Trader, based on your current metrics (${context.totalTrades || 0} trades, ${context.winRate || 0}% win rate), the primary objective is maintaining strict execution discipline. Stick strictly to your tested R:R criteria (minimum 1:1.5) and never widen stop losses during active drawdown cycles.`;
  }
}

export const aiManager = new AIManager();
