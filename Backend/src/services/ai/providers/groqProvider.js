import Groq from 'groq-sdk';

export class GroqProvider {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    this.name = 'groq';
    this.modelName = 'llama-3.3-70b-versatile';
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  getClient() {
    if (!this.isAvailable()) {
      throw new Error('Groq API key is not configured (GROQ_API_KEY missing in .env)');
    }
    return new Groq({ apiKey: this.apiKey.trim() });
  }

  /**
   * High-speed Text Trade Review (invoked as primary text or fallback from Gemini)
   */
  async analyzeTrade(trade) {
    const groq = this.getClient();

    const systemPrompt = `You are an institutional Forex and Financial Markets Trade Auditor.
Your job is to analyze trade execution, risk parameters, and strategy discipline.
Always return your analysis in valid JSON format matching this exact schema:
{
  "setupQualityScore": <integer 1 to 10>,
  "summary": "<concise 2-3 sentence overview>",
  "chartObservations": "<analytical evaluation of entry price, stop distance, target, and session dynamics>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "risksOrMistakes": ["<risk or mistake 1>", "<risk or mistake 2>"],
  "recommendations": ["<actionable takeaway 1>", "<actionable takeaway 2>", "<actionable takeaway 3>"]
}`;

    const userPrompt = `Evaluate this completed forex/crypto trade:
- Instrument: ${trade.instrument}
- Direction: ${trade.direction}
- Status: ${trade.status}
- Result: ${trade.result}
- Entry Price: ${trade.entryPrice}
- Exit Price: ${trade.exitPrice ?? 'Still Open'}
- Stop Loss: ${trade.stopLoss ?? 'None'}
- Take Profit: ${trade.takeProfit ?? 'None'}
- Planned R:R: ${trade.riskRewardRatio}
- Realized P/L: $${trade.profitLoss ?? 0}
- Session: ${trade.session || 'N/A'}
- Trader Notes: "${trade.notes || 'No trader notes'}"
- Tags / Strategies: ${trade.tags?.join(', ') || 'None'}
${trade.beforeTradeImage || trade.afterTradeImage ? '(Note: Visual screenshots were submitted; analyze based on trade parameters and price levels)' : ''}`;

    const completion = await groq.chat.completions.create({
      model: this.modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  }

  /**
   * Auto-Draft Journal Observations based on trade parameters
   */
  async generateNotes(tradeData) {
    const groq = this.getClient();

    const completion = await groq.chat.completions.create({
      model: this.modelName,
      messages: [
        {
          role: 'system',
          content: 'You are an experienced prop firm trader. Write concise, disciplined trade journal observations.',
        },
        {
          role: 'user',
          content: `Write 3 crisp bullet points for this setup:
Instrument: ${tradeData.instrument}
Direction: ${tradeData.direction}
Entry: ${tradeData.entryPrice}
Stop Loss: ${tradeData.stopLoss || 'N/A'}
Take Profit: ${tradeData.takeProfit || 'N/A'}
R:R: ${tradeData.riskRewardRatio || '1:2'}
Session: ${tradeData.session || 'London'}

Format:
- Rationale / Market Context:
- Confluence & Entry Trigger:
- Risk & Trade Management Plan:`,
        },
      ],
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content?.trim() || '';
  }

  /**
   * AI Trading Coach Conversation
   */
  async chatWithCoach(messages, context = {}) {
    const groq = this.getClient();

    const systemPrompt = `You are "AlphaCoach", an institutional trading psychologist and risk management mentor on TradeJournal.
Trader Context:
- Trades: ${context.totalTrades || 0}
- Win Rate: ${context.winRate || 0}%
- Total Realized P/L: $${context.totalPnL || 0}
- Profit Factor: ${context.profitFactor || 'N/A'}
- Max Drawdown: $${context.maxDrawdown || 0}

Deliver direct, disciplined, actionable feedback to help the trader cultivate consistency and edge.`;

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    const completion = await groq.chat.completions.create({
      model: this.modelName,
      messages: groqMessages,
      temperature: 0.4,
    });

    return completion.choices[0]?.message?.content?.trim() || '';
  }
}
