// components/admin/category-image-upload.tsx
"use client";

import React, { useState, useRef, useId } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Link2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface CategoryImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  categoryName?: string;
}

export function CategoryImageUpload({
  value,
  onChange,
  label = "Category Logo / Icon",
  categoryName,
}: CategoryImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const manualInputId = useId();

  // Handle direct file upload to API
  const handleUploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP, SVG, GIF)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size cannot exceed 10MB");
      return;
    }

    setIsUploading(true);
    setImgError(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/categories/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.url);
      toast.success("Category logo uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload logo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  const handleApplyManualUrl = () => {
    if (!manualUrl.trim()) return;
    onChange(manualUrl.trim());
    setImgError(false);
    setManualUrl("");
    setShowUrlInput(false);
    toast.success("Image URL applied");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-gold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Link2 size={12} />
          {showUrlInput ? "Hide URL input" : "Paste URL instead"}
        </button>
      </div>

      {/* Manual URL input option */}
      {showUrlInput && (
        <div className="flex gap-2 items-center bg-elevated/80 p-2.5 rounded-[var(--radius-btn)] border border-border">
          <input
            id={manualInputId}
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            aria-label="Image URL"
            className="flex-1 bg-void border border-border text-ink text-xs rounded px-3 py-1.5 focus:outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={handleApplyManualUrl}
            className="bg-gold text-void text-xs font-bold px-3 py-1.5 rounded hover:bg-gold-dim transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
      )}

      {/* Circular Logo Uploader Box */}
      <div className="flex items-center gap-5 p-3.5 bg-elevated/40 border border-border rounded-[var(--radius-card)]">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Circular Avatar / Preview Ring */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex-shrink-0 flex items-center justify-center cursor-pointer transition-all duration-300 border-2 overflow-hidden group ${
            isDragOver
              ? "border-gold bg-gold/10 scale-105"
              : value
              ? "border-gold/60 bg-surface shadow-[0_0_15px_rgba(232,168,62,0.15)]"
              : "border-dashed border-border hover:border-gold hover:bg-elevated/80"
          }`}
          title="Click or drop an image to upload logo"
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center text-gold">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-[9px] font-bold mt-1">Uploading</span>
            </div>
          ) : value && !imgError ? (
            <>
              {/* Loaded Image */}
              <div className="relative w-full h-full p-2 flex items-center justify-center bg-void/50">
                <Image
                  src={value}
                  alt={categoryName || "Category Logo"}
                  fill
                  sizes="(max-width: 96px) 96px, 96px"
                  className="object-contain p-1 rounded-full group-hover:scale-105 transition-transform duration-200"
                  onError={() => setImgError(true)}
                  unoptimized={value.startsWith("http")}
                />
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-void/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-gold text-[10px] font-bold">
                <Upload size={14} className="mb-0.5" />
                Change
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted group-hover:text-gold transition-colors p-2 text-center">
              <ImageIcon size={22} className="mb-1 opacity-70 group-hover:opacity-100" />
              <span className="text-[10px] font-semibold leading-tight">
                {isDragOver ? "Drop file" : "Upload Logo"}
              </span>
            </div>
          )}
        </div>

        {/* Upload Details & Actions */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-ink truncate">
              {value ? "Circular Preview" : "Upload Category Logo"}
            </span>
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                  setImgError(false);
                }}
                className="text-xs text-crimson hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <X size={12} /> Remove
              </button>
            )}
          </div>

          <p className="text-[11px] text-muted leading-relaxed">
            Displayed in a circular badge with bottom line title on the home page.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 rounded bg-elevated hover:bg-gold/15 hover:text-gold border border-border text-[11px] font-semibold text-ink transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Upload size={12} />
              {value ? "Replace Logo" : "Choose File"}
            </button>
            <span className="text-[10px] text-faint flex items-center">
              PNG, SVG, WEBP (Max 10MB)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryImageUpload;
