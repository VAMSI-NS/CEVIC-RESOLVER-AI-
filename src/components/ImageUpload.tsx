import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ImageAnalysis, Category } from '../types';

interface ImageUploadProps {
  onImageUploaded: (file: File, previewUrl: string, analysis?: ImageAnalysis) => void;
  onImageRemoved?: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  onImageRemoved,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setPreview(url);
      setAnalyzing(true);

      // Vision AI simulation
      setTimeout(() => {
        const dummyAnalysis: ImageAnalysis = {
          detectedObjects: ['Pothole', 'Damaged Asphalt', 'Road Crack'],
          severity: 'High',
          suggestedCategory: 'Roads',
          confidence: 0.96,
        };
        setAnalysisResult(dummyAnalysis);
        setAnalyzing(false);
        onImageUploaded(file, url, dummyAnalysis);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageRemoved?.();
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all shadow-sm">
            <Camera className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-800">
            Click to upload photo evidence
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            PNG, JPG, WEBP up to 10MB • Auto Vision AI classification
          </p>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-3 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 bg-black">
            <img src={preview} alt="Complaint preview" className="w-full h-full object-cover" />
            {analyzing && (
              <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-xs flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-1.5 text-left w-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-700">
                Photo Attached
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {analyzing ? (
              <p className="text-xs font-mono text-blue-600 animate-pulse">
                ⚡ Vision AI is analyzing photo...
              </p>
            ) : analysisResult ? (
              <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>AI Tag: {analysisResult.suggestedCategory} ({analysisResult.severity} Severity)</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  Objects detected: {analysisResult.detectedObjects.join(', ')}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;