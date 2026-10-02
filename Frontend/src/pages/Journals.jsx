import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Filter,
  X,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowUpDown,
} from 'lucide-react';
import { tradeService } from '../services/tradeService';
import { Badge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';

export const Journals = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 15 });
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters state
  const [search, setSearch] = useState('');
  const [instrument, setInstrument] = useState('');
  const [direction, setDirection] = useState('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const toast = useToast();
  const navigate = useNavigate();

  const fetchTrades = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        search: search || undefined,
        instrument: instrument || undefined,
        direction: direction || undefined,
        result: result || undefined,
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const res = await tradeService.getTrades(params);
      if (res.success) {
        setTrades(res.data.trades);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching trades:', err);
      toast.error('Failed to load trading journal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades(pagination.page);
  }, [pagination.page, instrument, direction, result, status, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTrades(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setInstrument('');
    setDirection('');
    setResult('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    fetchTrades(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      const res = await tradeService.deleteTrade(deleteId);
      if (res.success) {
        toast.success('Trade deleted successfully');
        setDeleteId(null);
        fetchTrades(pagination.page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete trade');
    } finally {
      setIsDeleting(false);
    }
  };

  const instrumentsList = [
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
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Title & Add New Trade Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200 dark:border-[#1f293d]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2 sm:gap-2.5">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>Trading Journals</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Historical log of all closed and active trades ({pagination.total} records)
          </p>
        </div>

        {/* Prominent Add New Trade Button */}
        <Link
          to="/journals/new"
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-cyan-500/20 active:scale-95 transition"
          id="btn-add-new-trade"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add New Trade</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm space-y-2.5 sm:space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by pair, tag, or trade notes..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-200 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition shrink-0"
          >
            Search
          </button>
        </form>

        {/* Filter Selectors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5 pt-1">
          {/* Instrument Filter */}
          <select
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
            className="py-1.5 px-2.5 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-200 dark:border-[#1f293d] text-gray-700 dark:text-gray-300 text-xs focus:outline-none focus:border-cyan-500 truncate"
          >
            <option value="">All Instruments</option>
            {instrumentsList.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>

          {/* Direction Filter */}
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="py-1.5 px-2.5 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-200 dark:border-[#1f293d] text-gray-700 dark:text-gray-300 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="">BUY / SELL</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>

          {/* Result Filter */}
          <select
            value={result}
            onChange={(e) => setResult(e.target.value)}
            className="py-1.5 px-2.5 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-200 dark:border-[#1f293d] text-gray-700 dark:text-gray-300 text-xs focus:outline-none focus:border-cyan-500 truncate"
          >
            <option value="">All Results</option>
            <option value="TP">Take Profit (TP)</option>
            <option value="SL">Stop Loss (SL)</option>
            <option value="BE">Break Even (BE)</option>
            <option value="Manual Exit">Manual Exit</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="py-1.5 px-2.5 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-200 dark:border-[#1f293d] text-gray-700 dark:text-gray-300 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="">Open / Closed</option>
            <option value="CLOSED">Closed Only</option>
            <option value="OPEN">Open Only</option>
          </select>

          {/* Start Date */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="py-1.5 px-2 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-200 dark:border-[#1f293d] text-gray-700 dark:text-gray-300 text-xs focus:outline-none focus:border-cyan-500"
          />

          {/* Clear Filters Button */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="py-1.5 px-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium transition flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Table / Mobile Card / Empty State */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-xs text-gray-400 animate-pulse">
          Loading trading journal records...
        </div>
      ) : trades.length === 0 ? (
        <div className="min-h-[45vh] flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] rounded-2xl shadow-sm">
          <BookOpen className="w-12 h-12 text-cyan-600/40 dark:text-cyan-400/40 mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No trades found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-5 leading-relaxed">
            {search || instrument || direction || result || status
              ? 'No trades match your active filter criteria. Try resetting the filters.'
              : 'Start building your trading journal by recording your first trade.'}
          </p>
          <Link
            to="/journals/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Trade</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] rounded-2xl overflow-hidden shadow-sm">
          {/* Mobile Trade Cards View (block md:hidden) */}
          <div className="block md:hidden divide-y divide-gray-100 dark:divide-[#1f293d]/60">
            {trades.map((t) => (
              <div key={t._id} className="p-3.5 space-y-2.5 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">{t.instrument}</span>
                    <Badge variant={t.direction} size="xs">{t.direction}</Badge>
                    <Badge variant={t.result} size="xs">{t.result}</Badge>
                  </div>
                  <span
                    className={`font-mono font-bold text-sm ${
                      t.profitLoss > 0
                        ? 'text-emerald-500 dark:text-emerald-400'
                        : t.profitLoss < 0
                        ? 'text-rose-500 dark:text-rose-400'
                        : 'text-amber-500 dark:text-amber-400'
                    }`}
                  >
                    {t.profitLoss > 0 ? `+$${t.profitLoss}` : `$${t.profitLoss}`}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#0a0e17] p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-gray-400">Entry</span>
                    <span className="font-mono text-gray-800 dark:text-gray-200">{t.entryPrice}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-gray-400">Exit</span>
                    <span className="font-mono text-gray-800 dark:text-gray-200">{t.exitPrice ?? '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-gray-400">R:R</span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">{t.riskRewardRatio}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-[11px] text-gray-400 font-mono">
                    {new Date(t.entryDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/journals/${t._id}`}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-cyan-600 dark:text-cyan-400 font-medium text-xs hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition"
                    >
                      View
                    </Link>
                    <Link
                      to={`/journals/${t._id}/edit`}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium text-xs hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteId(t._id)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      title="Delete trade"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-[#0e1422] text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-[#1f293d]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Instrument</th>
                  <th className="py-3 px-4">Side</th>
                  <th className="py-3 px-4">Entry</th>
                  <th className="py-3 px-4">Exit</th>
                  <th className="py-3 px-4">Lots</th>
                  <th className="py-3 px-4">R:R</th>
                  <th className="py-3 px-4">P/L</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#1f293d]/50 text-gray-700 dark:text-gray-200">
                {trades.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                    <td className="py-3 px-4 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(t.entryDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {t.instrument}
                      {t.customInstrument && (
                        <span className="text-[10px] text-gray-400 block font-normal">
                          {t.customInstrument}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant={t.direction}>{t.direction}</Badge>
                    </td>
                    <td className="py-3 px-4 font-mono">{t.entryPrice}</td>
                    <td className="py-3 px-4 font-mono text-gray-400">
                      {t.exitPrice !== null && t.exitPrice !== undefined ? t.exitPrice : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono">{t.quantity}</td>
                    <td className="py-3 px-4 font-mono text-cyan-600 dark:text-cyan-400 font-semibold">{t.riskRewardRatio}</td>
                    <td
                      className={`py-3 px-4 font-mono font-bold whitespace-nowrap ${
                        t.profitLoss > 0
                          ? 'text-emerald-500 dark:text-emerald-400'
                          : t.profitLoss < 0
                          ? 'text-rose-500 dark:text-rose-400'
                          : 'text-amber-500 dark:text-amber-400'
                      }`}
                    >
                      {t.profitLoss > 0 ? `+$${t.profitLoss}` : `$${t.profitLoss}`}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant={t.result}>{t.result}</Badge>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant={t.status}>{t.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/journals/${t._id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          title="View trade details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/journals/${t._id}/edit`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          title="Edit trade"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(t._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          title="Delete trade"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-[#0e1422] border-t border-gray-200 dark:border-[#1f293d] flex items-center justify-between text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              <span>
                Showing page <strong className="text-gray-900 dark:text-white">{pagination.page}</strong> of{' '}
                <strong className="text-gray-900 dark:text-white">{pagination.pages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Delete Trade Journal?"
        message="This action cannot be undone. Are you sure you want to permanently delete this trade from your journal?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
};
