import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, Check } from 'lucide-react';

interface ImageUploadProps {
  onUploadSuccess: (file: File) => void;
  isLoading?: boolean;
}

export function ImageUpload({ onUploadSuccess, isLoading = false }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPG and PNG files are allowed',
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size must be less than 5MB (current: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      };
    }

    return { valid: true };
  };

  const handleFile = (file: File) => {
    setError(null);
    setSuccess(false);

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    onUploadSuccess(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : error
              ? 'border-red-500 bg-red-50'
              : success
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={handleFileSelect}
          disabled={isLoading}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          {isLoading ? (
            <>
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Uploading...</p>
            </>
          ) : success ? (
            <>
              <Check className="w-8 h-8 text-green-500" />
              <p className="text-sm font-medium text-green-700">File ready for upload</p>
            </>
          ) : error ? (
            <>
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm font-medium">Drag & drop or click to upload</p>
              <p className="text-xs text-gray-500">JPG or PNG • Max 5MB</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
