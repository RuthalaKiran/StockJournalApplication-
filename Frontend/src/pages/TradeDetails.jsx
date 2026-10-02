import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Clock,
  Tag,
  FileText,
  DollarSign,
  Target,
  Shield,
  Layers,
  ZoomIn,
} from 'lucide-react';
import { tradeService } from '../services/tradeService';
import { Badge } from '../components/common/Badge';
import { Lightbox } from '../components/common/Lightbox';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';

export const TradeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTrade = async () => {
      try {
        setLoading(true);
        const res = await tradeService.getTradeById(id);
        if (res.success && res.data.trade) {
          setTrade(res.data.trade);
        }
      } catch (err) {
        toast.error('Failed to load trade details.');
        navigate('/journals');
      } finally {
        setLoading(false);
      }
    };
    fetchTrade();
  }, [id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await tradeService.deleteTrade(id);
      if (res.success) {
        toast.success('Trade deleted successfully');
        navigate('/journals');
      }
    } catch (err) {
      toast.error('Failed to delete trade');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xs text-gray-400 animate-pulse">
        Loading trade journal details...
      </div>
    );
  }

  if (!trade) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200 dark:border-[#1f293d]">
        <div className="flex items-center gap-3">
          <Link
            to="/journals"
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800/80 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {trade.instrument}
              </h1>
              <Badge variant={trade.direction}>{trade.direction}</Badge>
              <Badge variant={trade.result}>{trade.result}</Badge>
              <Badge variant={trade.status}>{trade.status}</Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Executed on {new Date(trade.entryDate).toLocaleDateString()} at {trade.entryTime}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            to={`/journals/${trade._id}/edit`}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition shadow-sm"
          >
            <Edit2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Edit Entry</span>
          </Link>
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-xs font-semibold transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Trade PnL Summary Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm dark:shadow-xl">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Realized Net Profit / Loss
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <h2
              className={`text-3xl font-extrabold font-mono ${
                trade.profitLoss > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : trade.profitLoss < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {trade.profitLoss > 0 ? `+$${trade.profitLoss}` : `$${trade.profitLoss}`}
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-mono">{trade.currency}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Risk:Reward
            </span>
            <p className="text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
              {trade.riskRewardRatio}
            </p>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-[#1f293d]" />
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Quantity / Lots
            </span>
            <p className="text-lg font-bold font-mono text-gray-900 dark:text-white mt-0.5">{trade.quantity}</p>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-[#1f293d]" />
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Session
            </span>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{trade.session || 'London'}</p>
          </div>
        </div>
      </div>

      {/* Metrics Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Entry Price */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Entry Price
          </span>
          <p className="text-lg font-bold font-mono text-gray-900 dark:text-white mt-1">{trade.entryPrice}</p>
          <span className="text-[11px] text-gray-500">{trade.entryTime}</span>
        </div>

        {/* Exit Price */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Exit Price
          </span>
          <p className="text-lg font-bold font-mono text-gray-900 dark:text-white mt-1">
            {trade.exitPrice !== null && trade.exitPrice !== undefined ? trade.exitPrice : '—'}
          </p>
          <span className="text-[11px] text-gray-500">{trade.exitTime || 'Closed'}</span>
        </div>

        {/* Stop Loss */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Stop Loss (SL)
          </span>
          <p className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {trade.stopLoss !== null && trade.stopLoss !== undefined ? trade.stopLoss : '—'}
          </p>
          <span className="text-[11px] text-gray-500">Max risk barrier</span>
        </div>

        {/* Take Profit */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Take Profit (TP)
          </span>
          <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {trade.takeProfit !== null && trade.takeProfit !== undefined ? trade.takeProfit : '—'}
          </p>
          <span className="text-[11px] text-gray-500">Target price level</span>
        </div>
      </div>

      {/* Execution Screenshots (Side-by-side with Lightbox zoom) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
          <span>Execution Screenshots</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before Screenshot */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Before Trade (Setup / Analysis)
            </span>
            {trade.beforeTradeImage ? (
              <div
                onClick={() =>
                  setLightboxImg({
                    url: trade.beforeTradeImage,
                    title: `${trade.instrument} - Setup Analysis`,
                  })
                }
                className="group relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-[#1f293d] bg-gray-50 dark:bg-[#0a0e17] cursor-pointer"
              >
                <img
                  src={trade.beforeTradeImage}
                  alt="Before trade screenshot"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-medium">
                  <ZoomIn className="w-5 h-5 text-cyan-400" />
                  <span>Click to Enlarge</span>
                </div>
              </div>
            ) : (
              <div className="aspect-video rounded-xl border border-dashed border-gray-200 dark:border-[#1f293d] bg-gray-50 dark:bg-[#0a0e17]/50 flex items-center justify-center text-xs text-gray-500">
                No before-trade screenshot recorded
              </div>
            )}
          </div>

          {/* After Screenshot */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              After Trade (Execution / Outcome)
            </span>
            {trade.afterTradeImage ? (
              <div
                onClick={() =>
                  setLightboxImg({
                    url: trade.afterTradeImage,
                    title: `${trade.instrument} - Execution Result`,
                  })
                }
                className="group relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-[#1f293d] bg-gray-50 dark:bg-[#0a0e17] cursor-pointer"
              >
                <img
                  src={trade.afterTradeImage}
                  alt="After trade screenshot"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-medium">
                  <ZoomIn className="w-5 h-5 text-cyan-400" />
                  <span>Click to Enlarge</span>
                </div>
              </div>
            ) : (
              <div className="aspect-video rounded-xl border border-dashed border-gray-200 dark:border-[#1f293d] bg-gray-50 dark:bg-[#0a0e17]/50 flex items-center justify-center text-xs text-gray-500">
                No after-trade screenshot recorded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Journal Notes & Reasoning */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>Journal Notes & Trade Reasoning</span>
        </h2>
        {trade.notes ? (
          <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-gray-50 dark:bg-[#0a0e17] p-4 rounded-xl border border-gray-200 dark:border-[#1f293d]">
            {trade.notes}
          </p>
        ) : (
          <p className="text-xs text-gray-500 italic">No notes logged for this trade.</p>
        )}
      </div>

      {/* Tags */}
      {trade.tags && trade.tags.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 flex items-center gap-2">
            <Tag className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Strategy & Setup Tags</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {trade.tags.map((tag) => (
              <span
                key={tag}
                className="py-1 px-3 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/25 text-cyan-700 dark:text-cyan-300 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox for zooming screenshots */}
      <Lightbox
        isOpen={Boolean(lightboxImg)}
        imageUrl={lightboxImg?.url}
        title={lightboxImg?.title}
        onClose={() => setLightboxImg(null)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete Trade Journal?"
        message="Are you sure you want to delete this trade? It will be permanently removed from your performance metrics and historical logs."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        isLoading={isDeleting}
      />
    </div>
  );
};
