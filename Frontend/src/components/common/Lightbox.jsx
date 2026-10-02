import React, { useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';

export const Lightbox = ({ isOpen, imageUrl, title, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 flex items-center gap-2 sm:gap-3 z-10">
        <span className="max-w-[180px] sm:max-w-none truncate text-xs sm:text-sm font-medium text-gray-300 bg-gray-900/80 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-700">
          {title || 'Screenshot Preview'}
        </span>
        <button
          onClick={onClose}
          className="p-1.5 sm:p-2 rounded-xl bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-700 transition"
          aria-label="Close lightbox"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="relative max-w-5xl max-h-[90dvh] overflow-hidden rounded-xl sm:rounded-2xl border border-gray-800 shadow-2xl">
        <img
          src={imageUrl}
          alt={title || 'Enlarged trade screenshot'}
          className="max-h-[82dvh] sm:max-h-[85vh] w-auto object-contain mx-auto"
        />
      </div>
    </div>
  );
};
