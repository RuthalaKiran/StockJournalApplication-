import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GeminiProvider {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.name = 'gemini';
    this.modelName = 'gemini-3.1-flash-lite';
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  getClient() {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key is not configured (GEMINI_API_KEY missing in .env)');
    }
    return new GoogleGenerativeAI(this.apiKey.trim());
  }

  /**
   * Helper to load an image path or URL into a Gemini inlineData object
   */
  async fileToGenerativePart(imageRef) {
    if (!imageRef) return null;

    try {
      let buffer;
      let mimeType = 'image/jpeg';

      if (imageRef.startsWith('http://') || imageRef.startsWith('https://')) {
        // Fetch remote URL (e.g. Cloudinary)
        const response = await fetch(imageRef);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('content-type');
        if (contentType) mimeType = contentType;
      } else {
        // Local upload path
        let filePath = imageRef;
        if (filePath.startsWith('/uploads/') || filePath.startsWith('uploads/')) {
          const cleanRel = filePath.replace(/^\/?uploads\//, '');
          filePath = path.join(__dirname, '../../../../uploads', cleanRel);
        }

        if (!fs.existsSync(filePath)) return null;
        buffer = await fs.promises.readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.webp') mimeType = 'image/webp';
      }

      return {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType,
        },
      };
    } catch (err) {
      console.warn(`[GeminiProvider] Could not load image for analysis: ${err.message}`);
      return null;
    }
  }

  /**
   * Multimodal Trade Review: analyzes trade parameters + before/after chart screenshots
   */
  async analyzeTrade(trade) {
    const ai = this.getClient();
    const model = ai.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const promptParts = [
      `You are an elite institutional Forex & Crypto Trading Mentor, risk manager, and technical analyst.
Analyze the following trade execution details and any attached chart screenshots (Before-Trade setup and After-Trade execution).

TRADE DETAILS:
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

INSTRUCTIONS:
1. Evaluate setup quality, market structure, key support/resistance levels, and execution discipline.
2. If chart screenshots are provided, examine trendlines, candle patterns, liquidity sweeps, and timing.
3. Return a valid JSON object matching EXACTLY this schema:
{
  "setupQualityScore": <integer from 1 to 10>,
  "summary": "<concise 2-3 sentence overview of the setup and result>",
  "chartObservations": "<detailed technical chart analysis observing market structure, levels, and pattern confirmation>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "risksOrMistakes": ["<risk/flaw 1>", "<risk/flaw 2>"],
  "recommendations": ["<actionable takeaway 1>", "<actionable takeaway 2>", "<actionable takeaway 3>"]
}`,
    ];

    // Attach Before-trade screenshot if present
    if (trade.beforeTradeImage) {
      const part = await this.fileToGenerativePart(trade.beforeTradeImage);
      if (part) {
        promptParts.push('BEFORE TRADE SETUP CHART SCREENSHOT:');
        promptParts.push(part);
      }
    }

    // Attach After-trade screenshot if present
    if (trade.afterTradeImage) {
      const part = await this.fileToGenerativePart(trade.afterTradeImage);
      if (part) {
        promptParts.push('AFTER TRADE OUTCOME CHART SCREENSHOT:');
        promptParts.push(part);
      }
    }

    const result = await model.generateContent(promptParts);
    const text = result.response.text();
    return JSON.parse(text);
  }

  /**
   * Auto-Draft Journal Observations based on trade parameters
   */
  async generateNotes(tradeData) {
    const ai = this.getClient();
    const model = ai.getGenerativeModel({ model: this.modelName });

    const prompt = `You are a professional forex trader. Write clear, structured journal entry notes for this trade setup:
Instrument: ${tradeData.instrument}
Direction: ${tradeData.direction}
Entry: ${tradeData.entryPrice}
Stop Loss: ${tradeData.stopLoss || 'N/A'}
Take Profit: ${tradeData.takeProfit || 'N/A'}
R:R: ${tradeData.riskRewardRatio || '1:2'}
Session: ${tradeData.session || 'London'}
Existing context/tags: ${tradeData.tags?.join(', ') || 'Technical setup'}

Format in 3 short, crisp bullet points:
- Rationale / Market Context:
- Confluence & Entry Trigger:
- Risk & Trade Management Plan:`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }

  /**
   * AI Trading Coach Conversation
   */
  async chatWithCoach(messages, context = {}) {
    const ai = this.getClient();
    const model = ai.getGenerativeModel({ model: this.modelName });

    const systemInstruction = `You are "AlphaCoach", an elite trading psychologist, risk manager, and quantitative trading mentor.
The user is a retail trader using TradeJournal.
User Context:
- Total Trades: ${context.totalTrades || 0}
- Win Rate: ${context.winRate || 0}%
- Total P/L: $${context.totalPnL || 0}
- Profit Factor: ${context.profitFactor || 'N/A'}
- Max Drawdown: $${context.maxDrawdown || 0}

Keep your responses direct, constructive, actionable, and focused on discipline, position sizing, and edge.`;

    const chat = model.startChat({
      history: messages.slice(0, -1).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    });

    const lastMsg = messages[messages.length - 1];
    const fullPrompt = `${systemInstruction}\n\nUser Question: ${lastMsg.content}`;
    const result = await chat.sendMessage(fullPrompt);
    return result.response.text().trim();
  }
}
