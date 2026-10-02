import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  X,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Save,
  Trash2,
} from 'lucide-react';
import { dailyPnlService } from '../services/dailyPnlService';
import { Badge } from '../components/common/Badge';
import { useToast } from '../components/common/Toast';

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  // Manual Daily PnL Edit Form State
  const [manualPnL, setManualPnL] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [savingManual, setSavingManual] = useState(false);

  const toast = useToast();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Format month string 'YYYY-MM'
  const monthString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  const fetchMonthData = async () => {
    try {
      setLoading(true);
      const res = await dailyPnlService.getCalendarData(monthString);
      if (res.success && res.data) {
        setCalendarData(res.data.days || []);

        // If a day is currently opened in modal, refresh its data
        if (selectedDay) {
          const updated = res.data.days.find((d) => d.date === selectedDay.date);
          if (updated) {
            setSelectedDay(updated);
            setManualPnL(updated.manualPnL !== null ? String(updated.manualPnL) : '');
            setManualNotes(updated.manualNotes || '');
          }
        }
      }
    } catch (err) {
      console.error('Failed to load calendar data:', err);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthData();
  }, [monthString]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleJumpToday = () => {
    setCurrentDate(new Date());
  };

  // Build grid days
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  // Convert so Monday = 0, Sunday = 6
  const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  // Create date lookup map
  const dayDataMap = {};
  calendarData.forEach((day) => {
    dayDataMap[day.date] = day;
  });

  const handleDateClick = (dayNumber) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
      dayNumber
    ).padStart(2, '0')}`;

    const existing = dayDataMap[dateStr] || {
      date: dateStr,
      tradePnL: 0,
      manualPnL: null,
      manualNotes: '',
      hasManual: false,
      tradesCount: 0,
      trades: [],
      effectivePnL: null,
    };

    setSelectedDay(existing);
    setManualPnL(existing.manualPnL !== null && existing.manualPnL !== undefined ? String(existing.manualPnL) : '');
    setManualNotes(existing.manualNotes || '');
  };

  const handleSaveManualPnL = async (e) => {
    e.preventDefault();
    if (!selectedDay) return;

    if (manualPnL === '' || isNaN(Number(manualPnL))) {
      toast.error('Please enter a valid numeric P/L amount.');
      return;
    }

    try {
      setSavingManual(true);
      const res = await dailyPnlService.saveDailyPnL({
        date: selectedDay.date,
        profitLoss: Number(manualPnL),
        notes: manualNotes,
      });

      if (res.success) {
        toast.success(`Daily P/L saved for ${selectedDay.date}`);
        await fetchMonthData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save daily P/L');
    } finally {
      setSavingManual(false);
    }
  };

  const handleDeleteManualPnL = async () => {
    if (!selectedDay || !selectedDay.hasManual) return;
    try {
      setSavingManual(true);
      const res = await dailyPnlService.deleteDailyPnL(selectedDay.date);
      if (res.success) {
        toast.success('Manual Daily P/L removed');
        setManualPnL('');
        setManualNotes('');
        await fetchMonthData();
      }
    } catch (err) {
      toast.error('Failed to remove manual P/L');
    } finally {
      setSavingManual(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate month net
  const monthNetPnL = calendarData.reduce((acc, d) => {
    return acc + (d.effectivePnL !== null ? Number(d.effectivePnL) : 0);
  }, 0);

  const monthTradesCount = calendarData.reduce((acc, d) => acc + (d.tradesCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Month Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-gray-200 dark:border-[#1f293d]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400" />
            <span>Trading Calendar</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Daily profit/loss tracking and trade reconciliation
          </p>
        </div>

        {/* Month Navigation & Today Button */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] rounded-xl p-1 shadow-sm flex-1 sm:flex-initial justify-between sm:justify-start">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 sm:px-3 text-xs font-bold text-gray-900 dark:text-white min-w-[110px] sm:min-w-[130px] text-center uppercase tracking-wider">
              {monthNames[currentMonth]} {currentYear}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleJumpToday}
            className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition shadow-sm shrink-0"
          >
            Today
          </button>
        </div>
      </div>

      {/* Month Realized Metric Card */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {monthNames[currentMonth]} Net P/L
            </span>
            <p
              className={`text-lg sm:text-xl font-bold font-mono ${
                monthNetPnL > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : monthNetPnL < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {monthNetPnL > 0 ? `+$${monthNetPnL.toFixed(2)}` : `$${monthNetPnL.toFixed(2)}`}
            </p>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-[#1f293d]" />
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Realized Trades
            </span>
            <p className="text-lg sm:text-xl font-bold font-mono text-gray-900 dark:text-white">{monthTradesCount}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-[#1f293d]">
          <span className="flex items-center gap-1 sm:gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500" />
            P/L &gt; 0 (Win)
          </span>
          <span className="flex items-center gap-1 sm:gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-rose-500/30 border border-rose-500" />
            P/L &lt; 0 (Loss)
          </span>
          <span className="flex items-center gap-1 sm:gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-500/30 border border-amber-500" />
            BE
          </span>
          <span className="flex items-center gap-1 sm:gap-1.5 text-gray-500 dark:text-gray-400 font-medium">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-gray-200 dark:bg-gray-800 border border-gray-400 dark:border-gray-700" />
            No P/L
          </span>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-[#1f293d] bg-gray-50 dark:bg-[#0d131f] text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 py-2 sm:py-3">
          <span><span className="sm:hidden">M</span><span className="hidden sm:inline">Mon</span></span>
          <span><span className="sm:hidden">T</span><span className="hidden sm:inline">Tue</span></span>
          <span><span className="sm:hidden">W</span><span className="hidden sm:inline">Wed</span></span>
          <span><span className="sm:hidden">T</span><span className="hidden sm:inline">Thu</span></span>
          <span><span className="sm:hidden">F</span><span className="hidden sm:inline">Fri</span></span>
          <span><span className="sm:hidden">S</span><span className="hidden sm:inline">Sat</span></span>
          <span><span className="sm:hidden">S</span><span className="hidden sm:inline">Sun</span></span>
        </div>

        {/* Month Grid Cells */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-[#1f293d]">
          {/* Previous Month Inactive Cells */}
          {Array.from({ length: adjustedFirstDay }).map((_, i) => {
            const dayNum = prevMonthDays - adjustedFirstDay + i + 1;
            return (
              <div
                key={`prev-${i}`}
                className="min-h-[58px] sm:min-h-[85px] md:min-h-[105px] p-1 sm:p-2 bg-gray-100/70 dark:bg-[#0a0e17]/60 text-gray-400 dark:text-gray-600 flex flex-col justify-between cursor-not-allowed select-none"
              >
                <span className="text-[10px] sm:text-xs font-mono">{dayNum}</span>
              </div>
            );
          })}

          {/* Current Month Active Cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
              dayNum
            ).padStart(2, '0')}`;

            const dayRecord = dayDataMap[dateStr];
            const hasData = dayRecord && dayRecord.effectivePnL !== null && dayRecord.effectivePnL !== undefined;
            const pnl = hasData ? Number(dayRecord.effectivePnL) : null;

            // MANDATORY COLOR SYSTEM:
            // P/L > 0  => Light Green background (dark/vibrant green text)
            // P/L < 0  => Light Red background (dark/vibrant red text)
            // P/L = 0  => Light Orange background (dark/vibrant orange text)
            // No P/L   => Normal calendar background, muted text
            let cellBgClass = 'bg-white dark:bg-[#111827] hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300';
            let pnlTextClass = 'text-gray-400 dark:text-gray-500';

            if (hasData) {
              if (pnl > 0) {
                // Subtle pastel green
                cellBgClass = 'bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 dark:border-emerald-500/30';
                pnlTextClass = 'text-emerald-600 dark:text-emerald-400 font-extrabold';
              } else if (pnl < 0) {
                // Subtle pastel red
                cellBgClass = 'bg-rose-50 hover:bg-rose-100/70 border border-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 dark:border-rose-500/30';
                pnlTextClass = 'text-rose-600 dark:text-rose-400 font-extrabold';
              } else {
                // Subtle pastel orange
                cellBgClass = 'bg-amber-50 hover:bg-amber-100/70 border border-amber-200 dark:bg-amber-950/40 dark:hover:bg-amber-950/60 dark:border-amber-500/30';
                pnlTextClass = 'text-amber-600 dark:text-amber-400 font-extrabold';
              }
            }

            const isToday =
              new Date().toISOString().split('T')[0] === dateStr;

            return (
              <div
                key={`curr-${dayNum}`}
                onClick={() => handleDateClick(dayNum)}
                className={`min-h-[58px] sm:min-h-[85px] md:min-h-[105px] p-1 sm:p-2 md:p-2.5 flex flex-col justify-between transition-all cursor-pointer select-none group relative ${cellBgClass}`}
              >
                {/* Date header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] sm:text-xs font-mono font-semibold rounded sm:rounded-md px-1 py-0.5 ${
                      isToday
                        ? 'bg-cyan-500 text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {dayRecord?.tradesCount > 0 && (
                    <span className="text-[8px] sm:text-[10px] font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-[#0a0e17]/70 px-0.5 sm:px-1 rounded border border-gray-200 dark:border-[#1f293d]">
                      {dayRecord.tradesCount}T
                    </span>
                  )}
                </div>

                {/* Day Realized P/L Value */}
                <div className="mt-0.5 sm:mt-1 flex flex-col">
                  {hasData ? (
                    <>
                      <span className={`text-[10px] sm:text-xs md:text-sm font-mono tracking-tight truncate ${pnlTextClass}`}>
                        {pnl > 0 ? `+$${pnl}` : `$${pnl}`}
                      </span>
                      {dayRecord.hasManual && (
                        <span className="hidden xs:inline text-[8px] sm:text-[9px] uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-semibold mt-0.5">
                          Manual
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-600">—</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Trailing Next Month Inactive Cells to fill grid (total multiple of 7) */}
          {(() => {
            const totalCells = adjustedFirstDay + daysInMonth;
            const remaining = (7 - (totalCells % 7)) % 7;
            return Array.from({ length: remaining }).map((_, i) => (
              <div
                key={`next-${i}`}
                className="min-h-[58px] sm:min-h-[85px] md:min-h-[105px] p-1 sm:p-2 bg-gray-100/70 dark:bg-[#0a0e17]/60 text-gray-400 dark:text-gray-600 flex flex-col justify-between cursor-not-allowed select-none"
              >
                <span className="text-[10px] sm:text-xs font-mono">{i + 1}</span>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Date Detail & Manual P/L Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setSelectedDay(null)}
          />

          <div className="relative w-full max-w-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] rounded-2xl shadow-2xl p-4 sm:p-6 z-10 max-h-[92dvh] overflow-y-auto animate-in zoom-in-95 duration-150 space-y-4 sm:space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#1f293d]">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>
                    {new Date(selectedDay.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">
                  Reconciliation & Trade Execution Breakdown
                </span>
              </div>

              <button
                onClick={() => setSelectedDay(null)}
                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Day PnL Summary */}
            <div className="p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-200 dark:border-[#1f293d] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Current Effective P/L
                </span>
                <p
                  className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${
                    selectedDay.effectivePnL > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : selectedDay.effectivePnL < 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : selectedDay.effectivePnL === 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-400'
                  }`}
                >
                  {selectedDay.effectivePnL !== null && selectedDay.effectivePnL !== undefined
                    ? selectedDay.effectivePnL > 0
                      ? `+$${selectedDay.effectivePnL}`
                      : `$${selectedDay.effectivePnL}`
                    : 'No P/L Recorded'}
                </p>
                <span className="text-[10px] text-gray-500">
                  {selectedDay.hasManual
                    ? 'Manually overridden daily entry'
                    : selectedDay.tradesCount > 0
                    ? `Calculated from ${selectedDay.tradesCount} closed trades`
                    : 'No recorded trades on this date'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Trade Realization
                </span>
                <p className="text-sm font-mono text-gray-900 dark:text-white mt-1">
                  ${selectedDay.tradePnL || 0}
                </p>
                <span className="text-[10px] text-gray-500">
                  {selectedDay.tradesCount} {selectedDay.tradesCount === 1 ? 'trade' : 'trades'}
                </span>
              </div>
            </div>

            {/* Trades taken on this day */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Executed Trades ({selectedDay.trades?.length || 0})
                </span>
                <Link
                  to="/journals/new"
                  onClick={() => setSelectedDay(null)}
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300"
                >
                  + Add Trade on this Day
                </Link>
              </div>

              {selectedDay.trades && selectedDay.trades.length > 0 ? (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {selectedDay.trades.map((t) => (
                    <div
                      key={t._id}
                      className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-200 dark:border-[#1f293d] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white">{t.instrument}</span>
                        <Badge variant={t.direction} size="xs">
                          {t.direction}
                        </Badge>
                        <Badge variant={t.result} size="xs">
                          {t.result}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono font-bold ${
                            t.profitLoss > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : t.profitLoss < 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {t.profitLoss > 0 ? `+$${t.profitLoss}` : `$${t.profitLoss}`}
                        </span>
                        <Link
                          to={`/journals/${t._id}`}
                          onClick={() => setSelectedDay(null)}
                          className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-medium"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic p-3 bg-gray-50 dark:bg-[#0a0e17] rounded-xl border border-gray-200 dark:border-[#1f293d]">
                  No individual trade entries recorded for this date.
                </p>
              )}
            </div>

            {/* Manual Daily P/L Entry Form */}
            <form
              onSubmit={handleSaveManualPnL}
              className="p-3.5 sm:p-4 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-200 dark:border-[#1f293d] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  {selectedDay.hasManual ? 'Edit Manual Daily P/L' : 'Add Manual Daily P/L'}
                </span>
                {selectedDay.hasManual && (
                  <button
                    type="button"
                    onClick={handleDeleteManualPnL}
                    disabled={savingManual}
                    className="text-xs text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Override</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Profit / Loss Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={manualPnL}
                    onChange={(e) => setManualPnL(e.target.value)}
                    placeholder="e.g. +90 or -20"
                    required
                    className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Daily Notes
                  </label>
                  <input
                    type="text"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    placeholder="e.g. Good trading day, followed plan"
                    className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end pt-1">
                <button
                  type="submit"
                  disabled={savingManual}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingManual ? 'Saving...' : 'Save Daily P/L'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
