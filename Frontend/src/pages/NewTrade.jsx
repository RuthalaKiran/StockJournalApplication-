import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  TrendingUp,
  TrendingDown,
  Calculator,
  Plus,
  X,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { tradeService } from '../services/tradeService';
import { aiService } from '../services/aiService';
import { ImageUpload } from '../components/common/ImageUpload';
import { Lightbox } from '../components/common/Lightbox';
import { useToast } from '../components/common/Toast';

export const NewTrade = () => {
  const { id } = useParams(); // If present, edit mode
  const isEditMode = Boolean(id);

  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState('');
  const [lightboxImg, setLightboxImg] = useState(null);
  const [isDraftingNotes, setIsDraftingNotes] = useState(false);

  // Form State
  const [instrument, setInstrument] = useState('XAUUSD');
  const [customInstrument, setCustomInstrument] = useState('');
  const [direction, setDirection] = useState('BUY');
  const [session, setSession] = useState('London');
  const [status, setStatus] = useState('CLOSED');

  const [entryPrice, setEntryPrice] = useState('');
  const [quantity, setQuantity] = useState('0.10');
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [entryTime, setEntryTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [riskRewardRatio, setRiskRewardRatio] = useState('1:2');
  const [autoRR, setAutoRR] = useState('1:2');

  const [exitPrice, setExitPrice] = useState('');
  const [exitDate, setExitDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [exitTime, setExitTime] = useState('12:00');
  const [result, setResult] = useState('TP');
  const [profitLoss, setProfitLoss] = useState('');

  const [beforeTradeImage, setBeforeTradeImage] = useState('');
  const [afterTradeImage, setAfterTradeImage] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState(['London Session']);
  const [tagInput, setTagInput] = useState('');

  const standardInstruments = [
    'XAUUSD',
    'BTCUSD',
    'ETHUSD',
    'EURUSD',
    'GBPUSD',
    'USDJPY',
    'USDCHF',
    'USDCAD',
    'AUDUSD',
    'NZDUSD',
    'EURJPY',
    'GBPJPY',
    'EURGBP',
    'CUSTOM',
  ];

  const standardTags = [
    'Breakout',
    'Liquidity',
    'Support/Resistance',
    'Trend',
    'Reversal',
    'News',
    'Scalping',
    'Swing',
    'London Session',
    'NY Session',
  ];

  // Fetch trade data if edit mode
  useEffect(() => {
    if (isEditMode) {
      const loadTrade = async () => {
        try {
          setFetching(true);
          const res = await tradeService.getTradeById(id);
          if (res.success && res.data.trade) {
            const t = res.data.trade;
            if (standardInstruments.includes(t.instrument)) {
              setInstrument(t.instrument);
            } else {
              setInstrument('CUSTOM');
              setCustomInstrument(t.instrument);
            }
            setDirection(t.direction);
            setSession(t.session || 'London');
            setStatus(t.status || 'CLOSED');
            setEntryPrice(String(t.entryPrice));
            setQuantity(String(t.quantity));
            setEntryDate(new Date(t.entryDate).toISOString().split('T')[0]);
            setEntryTime(t.entryTime || '00:00');
            if (t.stopLoss) setStopLoss(String(t.stopLoss));
            if (t.takeProfit) setTakeProfit(String(t.takeProfit));
            if (t.riskRewardRatio) setRiskRewardRatio(t.riskRewardRatio);
            if (t.exitPrice !== null && t.exitPrice !== undefined) setExitPrice(String(t.exitPrice));
            if (t.exitDate) setExitDate(new Date(t.exitDate).toISOString().split('T')[0]);
            if (t.exitTime) setExitTime(t.exitTime);
            if (t.result) setResult(t.result);
            if (t.profitLoss !== null && t.profitLoss !== undefined) setProfitLoss(String(t.profitLoss));
            if (t.beforeTradeImage) setBeforeTradeImage(t.beforeTradeImage);
            if (t.afterTradeImage) setAfterTradeImage(t.afterTradeImage);
            if (t.notes) setNotes(t.notes);
            if (Array.isArray(t.tags)) setTags(t.tags);
          }
        } catch (err) {
          toast.error('Failed to load trade data.');
          navigate('/journals');
        } finally {
          setFetching(false);
        }
      };
      loadTrade();
    }
  }, [id, isEditMode]);

  // Automatic Risk-to-Reward calculation
  useEffect(() => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);

    if (!isNaN(entry) && !isNaN(sl) && !isNaN(tp)) {
      let risk = 0;
      let reward = 0;

      if (direction === 'BUY') {
        risk = entry - sl;
        reward = tp - entry;
      } else {
        risk = sl - entry;
        reward = entry - tp;
      }

      if (risk > 0 && reward > 0) {
        const calculatedRatio = Number((reward / risk).toFixed(2));
        const formatted = `1:${calculatedRatio}`;
        setAutoRR(formatted);
        // Only set if user hasn't explicitly customized or is empty
        if (!riskRewardRatio || riskRewardRatio === '1:2') {
          setRiskRewardRatio(formatted);
        }
      }
    }
  }, [entryPrice, stopLoss, takeProfit, direction]);

  const handleAddTag = (tagToAdd) => {
    const trimmed = tagToAdd.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    const activeInstrument = instrument === 'CUSTOM' ? customInstrument.trim() : instrument;
    if (!activeInstrument) {
      setError('Please specify the trading instrument.');
      return;
    }

    if (!entryPrice || isNaN(Number(entryPrice))) {
      setError('A valid entry price is required.');
      return;
    }

    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      setError('A valid quantity / lot size greater than zero is required.');
      return;
    }

    // Ratio validation: must be 1:X format
    if (riskRewardRatio && !/^1:[0-9]+(\.[0-9]+)?$/.test(riskRewardRatio)) {
      setError('Risk-to-Reward Ratio must be in ratio format, e.g. 1:2 or 1:1.5');
      return;
    }

    if (status === 'CLOSED') {
      if (!exitPrice || isNaN(Number(exitPrice))) {
        setError('Exit price is required for closed trades.');
        return;
      }
      if (!result) {
        setError('Please select a trade result (TP, SL, BE, Manual Exit).');
        return;
      }
      if (profitLoss === '' || isNaN(Number(profitLoss))) {
        setError('Profit/Loss amount is required for closed trades.');
        return;
      }
    }

    const payload = {
      instrument: activeInstrument,
      customInstrument: instrument === 'CUSTOM' ? customInstrument : '',
      direction,
      session,
      status,
      entryPrice: Number(entryPrice),
      quantity: Number(quantity),
      entryDate,
      entryTime,
      stopLoss: stopLoss ? Number(stopLoss) : null,
      takeProfit: takeProfit ? Number(takeProfit) : null,
      riskRewardRatio: riskRewardRatio || autoRR || '1:2',
      exitPrice: status === 'CLOSED' ? Number(exitPrice) : null,
      exitDate: status === 'CLOSED' ? exitDate : null,
      exitTime: status === 'CLOSED' ? exitTime : '',
      result: status === 'CLOSED' ? result : 'Pending',
      profitLoss: status === 'CLOSED' ? Number(profitLoss) : 0,
      beforeTradeImage,
      afterTradeImage,
      notes,
      tags,
    };

    try {
      setLoading(true);
      if (isEditMode) {
        const res = await tradeService.updateTrade(id, payload);
        if (res.success) {
          toast.success('Trade updated successfully!');
          navigate(`/journals/${id}`);
        }
      } else {
        const res = await tradeService.createTrade(payload);
        if (res.success) {
          toast.success('Trade recorded in journal!');
          navigate('/journals');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save trade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDraftNotes = async () => {
    try {
      setIsDraftingNotes(true);
      toast.info('AI Router: Drafting journal notes based on your trade setup...');
      const res = await aiService.generateNotes({
        instrument: instrument === 'CUSTOM' ? customInstrument : instrument,
        direction,
        entryPrice: entryPrice ? Number(entryPrice) : 0,
        stopLoss: stopLoss ? Number(stopLoss) : null,
        takeProfit: takeProfit ? Number(takeProfit) : null,
        riskRewardRatio: riskRewardRatio || autoRR || '1:2',
        session,
        tags,
      });

      if (res.success && res.data?.notes) {
        setNotes((prev) => (prev ? `${prev}\n\n${res.data.notes}` : res.data.notes));
        toast.success('Journal notes auto-drafted!');
      }
    } catch (err) {
      toast.error('Failed to auto-draft observations');
    } finally {
      setIsDraftingNotes(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xs text-gray-400">
        Loading trade details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#1f293d]">
        <div className="flex items-center gap-3">
          <Link
            to="/journals"
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800/80 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {isEditMode ? 'Edit Trade Entry' : 'Record New Trade'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Enter trade parameters, execution levels, and screenshots
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/journals"
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/25 transition disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Trade...' : isEditMode ? 'Update Trade' : 'Save Trade'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-600 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: TRADE SETUP */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
            <span>1. Trade Setup</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Instrument Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Trading Instrument
              </label>
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
              >
                {standardInstruments.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst === 'CUSTOM' ? '+ Custom Instrument...' : inst}
                  </option>
                ))}
              </select>

              {instrument === 'CUSTOM' && (
                <input
                  type="text"
                  value={customInstrument}
                  onChange={(e) => setCustomInstrument(e.target.value)}
                  placeholder="Enter symbol (e.g. NAS100, US30)"
                  className="mt-2 w-full py-2 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-cyan-500/50 text-gray-900 dark:text-white text-xs font-mono uppercase focus:outline-none"
                  required
                />
              )}
            </div>

            {/* Direction BUY / SELL */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('BUY')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    direction === 'BUY'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-gray-50 dark:bg-[#0a0e17] text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-[#1f293d] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>BUY (Long)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDirection('SELL')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    direction === 'SELL'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-gray-50 dark:bg-[#0a0e17] text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-[#1f293d] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>SELL (Short)</span>
                </button>
              </div>
            </div>

            {/* Trading Session */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Trading Session
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="London">London Session</option>
                <option value="New York">New York Session</option>
                <option value="Asian">Asian Session</option>
                <option value="London + New York">London + New York (Overlap)</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: ENTRY & POSITION */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            2. Entry & Position
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Entry Price *
              </label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="e.g. 2650.50"
                required
                className="w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Quantity / Lot Size *
              </label>
              <input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 0.10"
                required
                className="w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Entry Date
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                required
                className="w-full py-2 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Entry Time
              </label>
              <input
                type="time"
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: RISK MANAGEMENT */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              3. Risk Management
            </h2>
            {autoRR && (
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Calculated R:R: <strong className="text-cyan-600 dark:text-cyan-400 font-mono">{autoRR}</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Stop Loss (SL)
              </label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="e.g. 2640.00"
                className="w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Take Profit (TP)
              </label>
              <input
                type="number"
                step="any"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="e.g. 2670.00"
                className="w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Risk-to-Reward Ratio (Ratio format e.g. 1:2)
              </label>
              <input
                type="text"
                value={riskRewardRatio}
                onChange={(e) => setRiskRewardRatio(e.target.value)}
                placeholder="1:2"
                className="w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-cyan-600 dark:text-cyan-400 font-bold text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: RESULT & STATUS */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              4. Trade Outcome & Realization
            </h2>

            {/* Open / Closed Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-[#0a0e17] border border-gray-200 dark:border-[#1f293d] rounded-xl">
              <button
                type="button"
                onClick={() => setStatus('CLOSED')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  status === 'CLOSED'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Closed Trade
              </button>
              <button
                type="button"
                onClick={() => setStatus('OPEN')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  status === 'OPEN'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Open / Active Trade
              </button>
            </div>
          </div>

          {status === 'CLOSED' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Exit Price */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Exit Price *
                </label>
                <input
                  type="number"
                  step="any"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  placeholder="e.g. 2670.00"
                  required={status === 'CLOSED'}
                  className="w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Trade Result */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Result *
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: 'TP', val: 'TP', active: 'bg-emerald-600 text-white shadow-sm' },
                    { label: 'SL', val: 'SL', active: 'bg-rose-600 text-white shadow-sm' },
                    { label: 'BE', val: 'BE', active: 'bg-amber-600 text-white shadow-sm' },
                    { label: 'Manual', val: 'Manual Exit', active: 'bg-blue-600 text-white shadow-sm' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setResult(item.val)}
                      className={`py-2 px-1 rounded-lg text-xs font-bold text-center transition ${
                        result === item.val
                          ? item.active
                          : 'bg-gray-50 dark:bg-[#0a0e17] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#1f293d] hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profit / Loss */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Profit / Loss ($) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={profitLoss}
                  onChange={(e) => setProfitLoss(e.target.value)}
                  placeholder="+90 or -20"
                  required={status === 'CLOSED'}
                  className={`w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-xs font-mono font-bold focus:outline-none focus:border-cyan-500 ${
                    Number(profitLoss) > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : Number(profitLoss) < 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                />
              </div>

              {/* Exit Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Exit Date
                </label>
                <input
                  type="date"
                  value={exitDate}
                  onChange={(e) => setExitDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#0a0e17] p-3.5 rounded-xl border border-gray-200 dark:border-[#1f293d]">
              This trade is currently <strong>ACTIVE</strong>. Realized exit price, profit/loss, and outcome badge can be filled when the trade is closed.
            </p>
          )}
        </div>

        {/* SECTION 5: SCREENSHOTS */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            5. Trade Execution Screenshots
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUpload
              label="Before Trade Screenshot (Setup / Analysis)"
              value={beforeTradeImage}
              onChange={setBeforeTradeImage}
              onPreviewClick={(url) => setLightboxImg({ url, title: 'Before Trade Analysis' })}
            />

            <ImageUpload
              label="After Trade Screenshot (Outcome / Execution)"
              value={afterTradeImage}
              onChange={setAfterTradeImage}
              onPreviewClick={(url) => setLightboxImg({ url, title: 'After Trade Execution' })}
            />
          </div>
        </div>

        {/* SECTION 6: JOURNAL & TAGS */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>6. Journal Observations & Tags</span>
          </h2>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Trade Reasoning & Journal Notes
              </label>
              <button
                type="button"
                onClick={handleAutoDraftNotes}
                disabled={isDraftingNotes}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 text-[11px] font-semibold transition disabled:opacity-50"
                title="Use AI Provider Router (Gemini/Groq) to auto-draft observations based on your entry and targets"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isDraftingNotes ? 'animate-spin' : ''}`} />
                <span>{isDraftingNotes ? 'Drafting Notes...' : '✨ Auto-Draft Observations'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Entered after Asian liquidity sweep and 15M market structure shift. Risk was controlled at 1%. Exited at TP after strong London momentum..."
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Trade Strategy & Setup Tags
            </label>

            {/* Active Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-medium"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-cyan-900 dark:hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Standard Suggestions */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {standardTags
                .filter((t) => !tags.includes(t))
                .map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddTag(suggestion)}
                    className="text-[11px] py-1 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white dark:hover:bg-gray-700 transition"
                  >
                    + {suggestion}
                  </button>
                ))}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Add custom tag..."
                className="flex-1 py-1.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-cyan-600 hover:text-white dark:bg-gray-800 text-gray-700 dark:text-white text-xs font-medium transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 7: SAVE & CANCEL */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[#1f293d]">
          <Link
            to="/journals"
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Trade...' : isEditMode ? 'Update Trade' : 'Save Trade'}</span>
          </button>
        </div>
      </form>

      {/* Lightbox for Screenshot Preview */}
      <Lightbox
        isOpen={Boolean(lightboxImg)}
        imageUrl={lightboxImg?.url}
        title={lightboxImg?.title}
        onClose={() => setLightboxImg(null)}
      />
    </div>
  );
};
