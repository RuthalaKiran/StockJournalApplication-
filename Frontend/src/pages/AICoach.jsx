import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  Award,
  Zap,
  User,
  ArrowRight,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

export const AICoach = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Suggested prompt chips for the trader
  const starterPrompts = [
    {
      title: 'Risk Audit',
      prompt: 'Audit my overall risk management, drawdown, and discipline based on my account metrics.',
      icon: ShieldAlert,
      color: 'text-amber-500',
    },
    {
      title: 'Loss Aversion',
      prompt: 'I am struggling with cutting winning trades too early and letting losers run. How can I fix this psychology?',
      icon: Zap,
      color: 'text-rose-500',
    },
    {
      title: 'Drawdown Recovery',
      prompt: 'What exact protocol should I follow after experiencing a 3-trade losing streak to prevent revenge trading?',
      icon: TrendingUp,
      color: 'text-blue-500',
    },
    {
      title: 'Win Rate vs R:R',
      prompt: 'Analyze my current win rate and profit factor. What minimum risk-to-reward ratio should I aim for?',
      icon: Award,
      color: 'text-emerald-500',
    },
  ];

  // Load initial trader metrics for the intelligence bar
  useEffect(() => {
    const fetchTraderContext = async () => {
      try {
        const res = await analyticsService.getDashboardAnalytics();
        if (res?.data?.overview) {
          const o = res.data.overview;
          setMetrics({
            totalTrades: o.totalTrades ?? 0,
            winRate: o.winRate ?? 0,
            profitFactor: o.profitFactor ?? 'N/A',
            totalPnL: o.totalPnL ?? 0,
            maxDrawdown: o.maxDrawdown ?? 0,
          });
        }
      } catch (err) {
        console.warn('Could not fetch trader metrics for coach bar:', err);
      }
    };
    fetchTraderContext();
  }, []);

  // Initialize greeting message once trader context is known
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Welcome to the Trading Room, ${user?.name?.split(' ')[0] || 'Trader'}.

I am **AlphaCoach**, your institutional trading psychologist, quantitative risk auditor, and execution mentor. 

I have direct access to your live trade logs, win rate, and drawdown metrics. Here to help you build psychological discipline, refine your risk-to-reward ratios, and eliminate emotional mistakes.

How can I help sharpen your edge today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [user]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setLoading(true);

    try {
      // Backend expects { messages: [{ role: 'user'|'assistant', content: string }] }
      const apiPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await aiService.chatWithCoach(apiPayload);
      if (res?.success && res.data?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.reply,
            timestamp: new Date(),
          },
        ]);

        if (res.data.context) {
          setMetrics(res.data.context);
        }
      } else {
        throw new Error(res?.message || 'No reply received from AI Coach');
      }
    } catch (err) {
      console.error('Chat with coach error:', err);
      showToast(err.response?.data?.message || err.message || 'Error communicating with AI Coach', 'error');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '⚠️ *I encountered a temporary communication delay. Please check your connection or try again in a moment.*',
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Chat session reset. I'm ready to review your next trading question or execution audit. What's on your mind?`,
        timestamp: new Date(),
      },
    ]);
    showToast('Conversation cleared', 'info');
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    showToast('Copied to clipboard', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Simple, clean Markdown-like parser for coach responses
  const renderFormattedMessage = (content) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // Empty line
          if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
          }

          // Heading 3: ### Title
          if (trimmed.startsWith('### ')) {
            return (
              <h4
                key={idx}
                className="text-base font-bold text-gray-900 dark:text-cyan-300 mt-3 pt-1 border-b border-gray-200/60 dark:border-gray-800/80 pb-1"
              >
                {trimmed.replace(/^###\s+/, '')}
              </h4>
            );
          }

          // Heading 2 / 1: ## Title
          if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
            return (
              <h3
                key={idx}
                className="text-base font-extrabold text-cyan-700 dark:text-cyan-400 mt-3"
              >
                {trimmed.replace(/^#+\s+/, '')}
              </h3>
            );
          }

          // Bullet points (* or -)
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            const itemText = trimmed.replace(/^[\*\-]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 text-gray-700 dark:text-gray-300">
                <span className="text-cyan-500 font-bold mt-1 text-xs">•</span>
                <span className="flex-1">{formatInline(itemText)}</span>
              </div>
            );
          }

          // Numbered lists (1. or 2.)
          if (/^\d+\.\s+/.test(trimmed)) {
            const num = trimmed.match(/^\d+\./)[0];
            const itemText = trimmed.replace(/^\d+\.\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 text-gray-700 dark:text-gray-300">
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold text-xs mt-0.5">{num}</span>
                <span className="flex-1">{formatInline(itemText)}</span>
              </div>
            );
          }

          // Regular paragraph
          return (
            <p key={idx} className="text-gray-800 dark:text-gray-200">
              {formatInline(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper for bold and code tags inline
  const formatInline = (text) => {
    // Replace **bold**
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-gray-950 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs text-cyan-600 dark:text-cyan-400"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-6xl mx-auto space-y-4">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-sm shrink-0">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  AlphaCoach
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-700/60 uppercase">
                  AI Mentor
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Dual Engine Online
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Institutional risk auditor & trading psychologist powered by Gemini Vision + Groq
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 transition-colors"
              title="Reset conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          </div>
        </div>

        {/* Live Trader Intelligence Strip */}
        {metrics && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="bg-gray-50 dark:bg-[#0a0e17]/60 rounded-xl p-2.5 border border-gray-200/60 dark:border-gray-800/60">
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Total Trades
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-0.5 block">
                {metrics.totalTrades}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-[#0a0e17]/60 rounded-xl p-2.5 border border-gray-200/60 dark:border-gray-800/60">
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Win Rate
              </span>
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 mt-0.5 block">
                {metrics.winRate}%
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-[#0a0e17]/60 rounded-xl p-2.5 border border-gray-200/60 dark:border-gray-800/60">
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Profit Factor
              </span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-0.5 block">
                {metrics.profitFactor}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-[#0a0e17]/60 rounded-xl p-2.5 border border-gray-200/60 dark:border-gray-800/60">
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Realized P/L
              </span>
              <span
                className={`text-sm font-bold mt-0.5 block ${
                  metrics.totalPnL >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {metrics.totalPnL >= 0 ? `+$${metrics.totalPnL}` : `-$${Math.abs(metrics.totalPnL)}`}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-gray-50 dark:bg-[#0a0e17]/60 rounded-xl p-2.5 border border-gray-200/60 dark:border-gray-800/60">
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Max Drawdown
              </span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                ${metrics.maxDrawdown}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Conversation Container */}
      <div className="flex-1 bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] rounded-2xl flex flex-col overflow-hidden shadow-sm transition-colors">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-200 dark:border-cyan-500/30 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-tr-none'
                      : msg.isError
                      ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 rounded-tl-none'
                      : 'bg-gray-50 dark:bg-[#0d121f] border border-gray-200/80 dark:border-[#1e273a] text-gray-900 dark:text-gray-100 rounded-tl-none'
                  }`}
                >
                  {/* Message Sender Header */}
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        isUser ? 'text-cyan-100' : 'text-cyan-600 dark:text-cyan-400'
                      }`}
                    >
                      {isUser ? user?.name || 'You' : 'AlphaCoach'}
                    </span>
                    <div className="flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                      <span className={`text-[10px] ${isUser ? 'text-cyan-100' : 'text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {!isUser && (
                        <button
                          onClick={() => copyToClipboard(msg.content, idx)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors ml-1"
                          title="Copy response"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  {isUser ? (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    renderFormattedMessage(msg.content)
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center shrink-0 mt-0.5 border border-gray-300 dark:border-gray-600 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing/Analyzing Indicator */}
          {loading && (
            <div className="flex gap-3 sm:gap-4 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-200 dark:border-cyan-500/30">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-gray-50 dark:bg-[#0d121f] border border-gray-200 dark:border-[#1e273a] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  AlphaCoach is reviewing your trade data and risk parameters...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompt Chips (displayed above input) */}
        <div className="px-4 py-2.5 bg-gray-50/60 dark:bg-[#0d121f]/50 border-t border-gray-200/80 dark:border-gray-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-cyan-500" />
              Prompts:
            </span>
            {starterPrompts.map((p, i) => {
              const Icon = p.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSend(p.prompt)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] hover:bg-cyan-50 dark:hover:bg-cyan-500/10 border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-500/30 text-gray-700 dark:text-gray-300 text-xs font-medium whitespace-nowrap transition-all shadow-2xs group"
                >
                  <Icon className={`w-3.5 h-3.5 ${p.color} group-hover:scale-110 transition-transform`} />
                  <span>{p.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-[#111827] border-t border-gray-200 dark:border-[#1f293d]">
          <div className="flex items-end gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask AlphaCoach about risk management, psychology, trade setups... (Enter to send)"
                disabled={loading}
                className="w-full resize-none max-h-32 min-h-[44px] py-2.5 px-3.5 text-sm rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-200 dark:border-gray-700/80 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
              />
            </div>

            <button
              onClick={() => handleSend()}
              disabled={loading || !inputValue.trim()}
              className="h-11 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 mt-2 px-1">
            <span>Press <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px]">Shift+Enter</kbd> for new line</span>
            <span>AlphaCoach educational intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
};
