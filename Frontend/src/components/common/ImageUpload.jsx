import React, { useState, useRef } from 'react';
import { UploadCloud, X, RefreshCw, Eye, Image as ImageIcon } from 'lucide-react';
import { tradeService } from '../../services/tradeService';

export const ImageUpload = ({
  label = 'Upload Screenshot',
  value = '',
  onChange,
  onPreviewClick,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const validateAndUpload = async (file) => {
    setErrorMessage('');
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Image must be JPG, PNG, JPEG or WEBP.');
      return;
    }

    // Validate size (5MB = 5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Maximum file size is 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      const res = await tradeService.uploadScreenshot(file);
      if (res.success && res.data?.url) {
        onChange(res.data.url);
      } else {
        setErrorMessage(res.message || 'Failed to upload screenshot.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error uploading image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-400">
        {label}
      </label>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {value ? (
        // Preview State
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-[#1f293d] bg-gray-50 dark:bg-[#0d131f] aspect-video flex items-center justify-center">
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Action overlay */}
          <div className="absolute inset-0 bg-black/40 sm:bg-black/60 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 sm:gap-3">
            {onPreviewClick && (
              <button
                type="button"
                onClick={() => onPreviewClick(value)}
                className="p-2 rounded-xl bg-gray-900/90 text-gray-200 hover:text-white hover:bg-cyan-600 shadow-md transition"
                title="Preview full image"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-gray-900/90 text-gray-200 hover:text-white hover:bg-blue-600 shadow-md transition"
              title="Replace image"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 rounded-xl bg-gray-900/90 text-gray-200 hover:text-white hover:bg-rose-600 shadow-md transition"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        // Upload Dropzone State
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all aspect-video ${
            isDragging
              ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01]'
              : 'border-gray-300 hover:border-cyan-500/60 bg-gray-50 hover:bg-gray-100/70 dark:border-[#1f293d] dark:hover:border-cyan-500/50 dark:bg-[#0d131f]/60 dark:hover:bg-[#0d131f]'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-8 h-8 text-cyan-600 dark:text-cyan-400 animate-spin" />
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Uploading screenshot...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-1">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Click to upload <span className="text-gray-500 dark:text-gray-400 font-normal">or drag & drop</span>
              </p>
              <p className="text-[11px] text-gray-500">
                PNG, JPG, WEBP (Max 5MB)
              </p>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">{errorMessage}</p>
      )}
    </div>
  );
};
