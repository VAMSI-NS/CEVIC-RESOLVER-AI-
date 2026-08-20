import React, { useState, useCallback } from 'react';
import { Upload, X, Eye, Scan, CheckCircle2, Sparkles } from 'lucide-react';
import { analyzeImage } from '../services/aiService';
import type { ImageAnalysis } from '../types';

interface ImageUploadProps {
  onImageUploaded: (file: File, url: string, analysis?: ImageAnalysis) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUploaded }) => {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const url = URL.createObjectURL(file);
    setPreview(url);
    setUploadedFile(file);
    setAnalyzing(true);
    setAnalysis(null);

    try {
      const result = await analyzeImage(file);
      setAnalysis(result);
      onImageUploaded(file, url, result);
    } finally {
      setAnalyzing(false);
    }
  }, [onImageUploaded]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    setPreview(null);
    setAnalysis(null);
    setUploadedFile(null);
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer ${
            dragging
              ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
              : 'border-white/[0.12] hover:border-cyan-400/50 bg-white/[0.02] hover:bg-white/[0.04]'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/[0.05] text-slate-400'}`}>
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white text-xs sm:text-sm">Upload Photo Evidence</p>
              <p className="text-xs text-slate-400 mt-0.5">
                AI Vision will scan and confirm the civic hazard
              </p>
            </div>
            <p className="text-[10px] text-slate-500 font-mono bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
              PNG, JPG, WEBP — up to 10MB
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Preview */}
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.12]">
            <img
              src={preview}
              alt="Uploaded civic report"
              className="w-full h-48 object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-3 right-3 w-7 h-7 bg-rose-600 text-white rounded-full flex items-center justify-center hover:bg-rose-500 transition-colors shadow-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Scanning Overlay */}
            {analyzing && (
              <div className="absolute inset-0 bg-[#050B14]/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                <div className="relative">
                  <div className="w-12 h-12 border-3 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                  <Scan className="w-5 h-5 text-cyan-300 absolute inset-0 m-auto" />
                </div>
                <p className="text-white font-mono font-bold text-xs tracking-wider">Vision AI Scanning...</p>
              </div>
            )}
          </div>

          {/* Vision Result Box */}
          {analysis && !analyzing && (
            <div className="bg-[#0B1625]/90 border border-cyan-400/30 rounded-2xl p-4 space-y-2.5 shadow-glow-cyan text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scan className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white font-display">Vision AI Verified</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {analysis.confidence}% Confidence
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400">Detected:</span>
                {analysis.detectedObjects.map((obj, i) => (
                  <span key={i} className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-full font-mono text-[10px]">
                    {obj}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;