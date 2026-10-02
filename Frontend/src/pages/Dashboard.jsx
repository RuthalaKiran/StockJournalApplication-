import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  DollarSign,
  Target,
  BarChart2,
  Calendar as CalendarIcon,
  PlusCircle,
  HelpCircle,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Clock,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { Badge } from '../components/common/Badge';
import { useTheme } from '../context/ThemeContext';

export const Dashboard = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('all');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'instruments' | 'sessions' | 'results'

  const fetchDashboardData = async (selectedRange) => {
    try {
      setLoading(true);
      const res = await analyticsService.getDashboardAnalytics({ range: selectedRange });
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(range);
  }, [range]);

  const metrics = data?.metrics || {};
  const recentTrades = data?.recentTrades || [];
  const instrumentAnalysis = data?.instrumentAnalysis || [];
  const sessionAnalysis = data?.sessionAnalysis || [];
  const resultAnalysis = data?.resultAnalysis || [];
  const todaySummary = data?.todaySummary || { pnl: 0, trades: 0, winRate: 0 };

  const ranges = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Last Month', value: 'last_month' },
    { label: '3 Months', value: '3_months' },
    { label: 'This Year', value: 'year' },
    { label: 'All Time', value: 'all' },
  ];

  // Win/Loss distribution for Pie Chart
  const pieData = [
    { name: 'Winning Trades', value: metrics.winningTrades || 0, color: '#10b981' },
    { name: 'Losing Trades', value: metrics.losingTrades || 0, color: '#ef4444' },
    { name: 'Break Even', value: metrics.breakEvenTrades || 0, color: '#f59e0b' },
  ].filter((item) => item.value > 0);

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-800/40 rounded-xl w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 bg-white dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-[#1f293d]" />
          ))}
        </div>
        <div className="h-72 bg-white dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-[#1f293d]" />
      </div>
    );
  }

  // Empty state when user has zero trades
  if (!loading && (!metrics.totalTrades || metrics.totalTrades === 0)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-[#111827]/40 border border-gray-200 dark:border-[#1f293d] rounded-2xl shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4 shadow-lg shadow-cyan-500/10">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Not enough trading data yet</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6 leading-relaxed">
          Record your historical or live trades to unlock institutional analytics, equity curve tracking, win rate distributions, and drawdown metrics.
        </p>
        <div className="flex items-center gap-3">
          <Link
            to="/journals/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/25 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Your First Trade</span>
          </Link>
          <Link
            to="/calendar"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Open Calendar</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header & Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200 dark:border-[#1f293d]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Performance Terminal
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Realized trade statistics and risk management analytics
          </p>
        </div>

        {/* Date Filter Badges - Horizontal scroll on mobile */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] overflow-x-auto no-scrollbar max-w-full">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                range === r.value
                  ? 'bg-cyan-500 text-white font-semibold shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800/60'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Summary Banner & Streaks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's PnL */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Today's Realized P/L
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-xl font-bold font-mono ${
                  todaySummary.pnl > 0
                    ? 'text-emerald-500 dark:text-emerald-400'
                    : todaySummary.pnl < 0
                    ? 'text-rose-500 dark:text-rose-400'
                    : 'text-amber-500 dark:text-amber-400'
                }`}
              >
                {todaySummary.pnl > 0 ? `+$${todaySummary.pnl}` : `$${todaySummary.pnl}`}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({todaySummary.trades} {todaySummary.trades === 1 ? 'trade' : 'trades'})
              </span>
            </div>
          </div>
          <div
            className={`p-2.5 rounded-xl ${
              todaySummary.pnl >= 0 ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500 dark:text-rose-400'
            }`}
          >
            {todaySummary.pnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
        </div>

        {/* Current Streak */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Current Streak
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <Flame
                className={`w-5 h-5 ${
                  metrics.currentStreak?.type === 'WIN'
                    ? 'text-emerald-500 dark:text-emerald-400 animate-pulse'
                    : metrics.currentStreak?.type === 'LOSS'
                    ? 'text-rose-500 dark:text-rose-400'
                    : 'text-gray-400'
                }`}
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                {metrics.currentStreak?.count || 0}{' '}
                <span className="text-xs text-gray-500 dark:text-gray-400 font-sans font-normal">
                  {metrics.currentStreak?.type === 'WIN'
                    ? 'Wins'
                    : metrics.currentStreak?.type === 'LOSS'
                    ? 'Losses'
                    : 'Neutral'}
                </span>
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-500 font-medium">
            Best: {metrics.bestWinningStreak || 0} Wins
          </span>
        </div>

        {/* Expectancy */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Expectancy
              </span>
              <div
                className="group relative cursor-pointer"
                title="(Win Rate × Avg Win) + (Loss Rate × Avg Loss)"
              >
                <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-cyan-500" />
              </div>
            </div>
            <div className="text-xl font-bold font-mono mt-1 text-cyan-600 dark:text-cyan-400">
              {metrics.expectancy > 0 ? `+$${metrics.expectancy}` : `$${metrics.expectancy}`}
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal font-sans ml-1">/ trade</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Target className="w-5 h-5" />
          </div>
        </div>

        {/* Maximum Drawdown */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Max Drawdown
            </span>
            <div className="text-xl font-bold font-mono text-rose-500 dark:text-rose-400 mt-1">
              -${metrics.maxDrawdown || 0}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        {/* Total Realized P/L */}
        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block truncate">
            Net Realized P/L
          </span>
          <p
            className={`text-lg sm:text-xl font-bold font-mono mt-1.5 truncate ${
              metrics.totalPnL > 0
                ? 'text-emerald-500 dark:text-emerald-400'
                : metrics.totalPnL < 0
                ? 'text-rose-500 dark:text-rose-400'
                : 'text-amber-500 dark:text-amber-400'
            }`}
          >
            {metrics.totalPnL > 0 ? `+$${metrics.totalPnL}` : `$${metrics.totalPnL}`}
          </p>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block truncate">Realized net result</span>
        </div>

        {/* Total Trades */}
        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block truncate">
            Total Closed
          </span>
          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white font-mono mt-1.5 truncate">
            {metrics.totalTrades || 0}
          </p>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block truncate">
            {metrics.winningTrades}W · {metrics.losingTrades}L · {metrics.breakEvenTrades}BE
          </span>
        </div>

        {/* Win Rate */}
        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block truncate">
            Win Rate
          </span>
          <p className="text-lg sm:text-xl font-bold text-emerald-500 dark:text-emerald-400 font-mono mt-1.5 truncate">
            {metrics.winRate}%
          </p>
          <span className="text-[10px] text-rose-500/80 dark:text-rose-400/80 mt-1 block truncate">
            Loss Rate: {metrics.lossRate}%
          </span>
        </div>

        {/* Profit Factor */}
        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block truncate">
            Profit Factor
          </span>
          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white font-mono mt-1.5 truncate">
            {metrics.profitFactor !== null ? metrics.profitFactor : '—'}
          </p>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block truncate">Gross Win / Gross Loss</span>
        </div>

        {/* Average Win */}
        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block truncate">
            Average Win
          </span>
          <p className="text-lg sm:text-xl font-bold text-emerald-500 dark:text-emerald-400 font-mono mt-1.5 truncate">
            +${metrics.averageWin || 0}
          </p>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block truncate">Per winning trade</span>
        </div>

        {/* Average Loss */}
        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block truncate">
            Average Loss
          </span>
          <p className="text-lg sm:text-xl font-bold text-rose-500 dark:text-rose-400 font-mono mt-1.5 truncate">
            ${metrics.averageLoss || 0}
          </p>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block truncate">Per losing trade</span>
        </div>
      </div>

      {/* Chart Section: Equity Curve + Win/Loss Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Equity Curve (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Cumulative Realized Equity Curve
              </h2>
            </div>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
              Net: ${metrics.totalPnL}
            </span>
          </div>

          <div className="h-64 w-full">
            {metrics.equityCurve && metrics.equityCurve.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metrics.equityCurve}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f293d' : '#e2e8f0'} vertical={false} />
                  <XAxis
                    dataKey="tradeIndex"
                    stroke={isDark ? '#475569' : '#cbd5e1'}
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={isDark ? '#475569' : '#cbd5e1'}
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                    tickLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0d131f' : '#ffffff',
                      borderColor: isDark ? '#1f293d' : '#e2e8f0',
                      borderRadius: '12px',
                      boxShadow: isDark
                        ? '0 10px 25px -5px rgba(0, 0, 0, 0.6)'
                        : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px',
                    }}
                    itemStyle={{ color: '#06b6d4', fontWeight: 600, fontSize: '13px' }}
                    labelStyle={{ color: isDark ? '#9ca3af' : '#64748b', fontSize: '11px', marginBottom: '2px' }}
                    formatter={(val) => [`${Number(val) >= 0 ? '+$' : '$'}${val}`, 'Cumulative Equity']}
                    labelFormatter={(index) => `Trade #${index}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativePnL"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#equityGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Insufficient trade sequence data
              </div>
            )}
          </div>
        </div>

        {/* Win/Loss Donut Chart (1 Col) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Win / Loss Distribution
            </h2>
          </div>

          <div className="h-52 w-full flex items-center justify-center relative">
            {pieData.length > 0 ? (
              <>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                  <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">
                    {metrics.winRate || 0}%
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                    Win Rate
                  </span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#0d131f' : '#ffffff',
                        borderColor: isDark ? '#1f293d' : '#e2e8f0',
                        borderRadius: '12px',
                        boxShadow: isDark
                          ? '0 10px 25px -5px rgba(0, 0, 0, 0.6)'
                          : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        padding: '8px 12px',
                      }}
                      itemStyle={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: 600, fontSize: '13px' }}
                      labelStyle={{ color: isDark ? '#9ca3af' : '#64748b', fontWeight: 500, fontSize: '11px', marginBottom: '2px' }}
                      formatter={(val, name) => {
                        const total = metrics.totalTrades || 1;
                        const pct = ((val / total) * 100).toFixed(1);
                        return [`${val} trades (${pct}%)`, name];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <p className="text-xs text-gray-400">No data</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-[#1f293d] text-center">
            <div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Wins</span>
              <p className="text-xs font-bold font-mono text-emerald-500 dark:text-emerald-400">
                {metrics.winningTrades || 0}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Losses</span>
              <p className="text-xs font-bold font-mono text-rose-500 dark:text-rose-400">
                {metrics.losingTrades || 0}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">BE</span>
              <p className="text-xs font-bold font-mono text-amber-500 dark:text-amber-400">
                {metrics.breakEvenTrades || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Realized PnL Bar Chart */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Daily Realized Profit & Loss
            </h2>
          </div>
        </div>

        <div className="h-56 w-full">
          {metrics.dailyPnL && metrics.dailyPnL.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.dailyPnL}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f293d' : '#e2e8f0'} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke={isDark ? '#475569' : '#cbd5e1'}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
                  tickLine={false}
                />
                <YAxis
                  stroke={isDark ? '#475569' : '#cbd5e1'}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
                  tickLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0d131f' : '#ffffff',
                    borderColor: isDark ? '#1f293d' : '#e2e8f0',
                    borderRadius: '12px',
                    boxShadow: isDark
                      ? '0 10px 25px -5px rgba(0, 0, 0, 0.6)'
                      : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    padding: '8px 12px',
                  }}
                  itemStyle={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: 600, fontSize: '13px' }}
                  labelStyle={{ color: isDark ? '#9ca3af' : '#64748b', fontSize: '11px', marginBottom: '2px' }}
                  formatter={(val) => [`${Number(val) >= 0 ? '+$' : '$'}${val}`, 'Daily P/L']}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {metrics.dailyPnL.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              No daily P/L records for selected timeframe
            </div>
          )}
        </div>
      </div>

      {/* Buy vs Sell Performance Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* BUY Side */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block">
                BUY Performance
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {metrics.buyPerformance?.trades || 0} trades taken
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={`text-base font-bold font-mono ${
                (metrics.buyPerformance?.pnl || 0) >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
              }`}
            >
              {(metrics.buyPerformance?.pnl || 0) >= 0
                ? `+$${metrics.buyPerformance?.pnl || 0}`
                : `$${metrics.buyPerformance?.pnl || 0}`}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Win Rate: {metrics.buyPerformance?.winRate || 0}%
            </span>
          </div>
        </div>

        {/* SELL Side */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 dark:text-rose-400 shrink-0">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block">
                SELL Performance
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {metrics.sellPerformance?.trades || 0} trades taken
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={`text-base font-bold font-mono ${
                (metrics.sellPerformance?.pnl || 0) >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
              }`}
            >
              {(metrics.sellPerformance?.pnl || 0) >= 0
                ? `+$${metrics.sellPerformance?.pnl || 0}`
                : `$${metrics.sellPerformance?.pnl || 0}`}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Win Rate: {metrics.sellPerformance?.winRate || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Deep Analytics Sub-Sections Tabs */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-[#1f293d] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Deep Analytics Breakdown
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setActiveTab('instruments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'instruments'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/40'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Instruments
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'sessions'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/40'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Sessions
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'results'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/40'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Outcomes
            </button>
          </div>
        </div>

        {/* Tab 1: Instrument Analysis */}
        {activeTab === 'instruments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-[#0e1422] text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-[#1f293d]">
                <tr>
                  <th className="py-2.5 px-3">Instrument</th>
                  <th className="py-2.5 px-3">Trades</th>
                  <th className="py-2.5 px-3">Win Rate</th>
                  <th className="py-2.5 px-3">Total P/L</th>
                  <th className="py-2.5 px-3">Avg P/L</th>
                  <th className="py-2.5 px-3">Best</th>
                  <th className="py-2.5 px-3">Worst</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#1f293d]/50 text-gray-700 dark:text-gray-200">
                {instrumentAnalysis.map((item) => (
                  <tr key={item.instrument} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">{item.instrument}</td>
                    <td className="py-3 px-3 font-mono">{item.trades}</td>
                    <td className="py-3 px-3 font-mono text-cyan-600 dark:text-cyan-400">{item.winRate}%</td>
                    <td
                      className={`py-3 px-3 font-mono font-bold ${
                        item.totalPnL > 0
                          ? 'text-emerald-500 dark:text-emerald-400'
                          : item.totalPnL < 0
                          ? 'text-rose-500 dark:text-rose-400'
                          : 'text-amber-500 dark:text-amber-400'
                      }`}
                    >
                      {item.totalPnL > 0 ? `+$${item.totalPnL}` : `$${item.totalPnL}`}
                    </td>
                    <td className="py-3 px-3 font-mono">${item.averagePnL}</td>
                    <td className="py-3 px-3 font-mono text-emerald-500 dark:text-emerald-400">+${item.bestTrade}</td>
                    <td className="py-3 px-3 font-mono text-rose-500 dark:text-rose-400">${item.worstTrade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Sessions */}
        {activeTab === 'sessions' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {sessionAnalysis.map((s) => (
              <div
                key={s.session}
                className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-200 dark:border-[#1f293d]"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>{s.session}</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Trades:</span>
                    <span className="font-mono text-gray-900 dark:text-white">{s.trades}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Win Rate:</span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400">{s.winRate}%</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Total P/L:</span>
                    <span
                      className={`font-mono font-bold ${
                        s.totalPnL >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                      }`}
                    >
                      {s.totalPnL >= 0 ? `+$${s.totalPnL}` : `$${s.totalPnL}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Outcomes */}
        {activeTab === 'results' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {resultAnalysis.map((r) => (
              <div key={r.result} className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-200 dark:border-[#1f293d]">
                <Badge variant={r.result} size="sm">
                  {r.result}
                </Badge>
                <div className="mt-2 space-y-1 text-xs">
                  <p className="text-gray-500 dark:text-gray-400">
                    Count:{' '}
                    <span className="text-gray-900 dark:text-white font-mono font-semibold">
                      {r.count} ({r.percentage}%)
                    </span>
                  </p>
                  <p
                    className={`font-mono font-bold ${
                      r.totalPnL >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                    }`}
                  >
                    {r.totalPnL >= 0 ? `+$${r.totalPnL}` : `$${r.totalPnL}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Trades Table */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Recent Journal Entries
            </h2>
          </div>
          <Link
            to="/journals"
            className="text-xs font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 transition"
          >
            View All Journals →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-[#0e1422] text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-[#1f293d]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Instrument</th>
                <th className="py-2.5 px-3">Side</th>
                <th className="py-2.5 px-3">R:R</th>
                <th className="py-2.5 px-3">P/L</th>
                <th className="py-2.5 px-3">Result</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#1f293d]/50 text-gray-700 dark:text-gray-200">
              {recentTrades.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                  <td className="py-3 px-3 font-mono text-gray-500 dark:text-gray-400">
                    {new Date(t.entryDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">{t.instrument}</td>
                  <td className="py-3 px-3">
                    <Badge variant={t.direction}>{t.direction}</Badge>
                  </td>
                  <td className="py-3 px-3 font-mono">{t.riskRewardRatio}</td>
                  <td
                    className={`py-3 px-3 font-mono font-bold ${
                      t.profitLoss > 0
                        ? 'text-emerald-500 dark:text-emerald-400'
                        : t.profitLoss < 0
                        ? 'text-rose-500 dark:text-rose-400'
                        : 'text-amber-500 dark:text-amber-400'
                    }`}
                  >
                    {t.profitLoss > 0 ? `+$${t.profitLoss}` : `$${t.profitLoss}`}
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={t.result}>{t.result}</Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to={`/journals/${t._id}`}
                      className="text-xs text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
