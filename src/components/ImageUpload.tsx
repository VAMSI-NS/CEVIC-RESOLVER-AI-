import React, { useState, useCallback } from 'react';
import { Upload, X, Eye, Scan, CheckCircle } from 'lucide-react';
import { analyzeImage } from '../services/aiService';
import type { ImageAnalysis } from '../types';

interface ImageUploadProps {
  onImageUploaded: (file: File, url: string, analysis?: ImageAnalysis) => void;
}

/** Drag-and-drop image uploader with Vision AI simulation */
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

  const severityColor = {
    High: 'text-red-600 bg-red-50',
    Medium: 'text-orange-600 bg-orange-50',
    Low: 'text-green-600 bg-green-50',
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
            dragging
              ? 'border-indigo-500 bg-indigo-50 scale-[1.02]'
              : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-indigo-100' : 'bg-gray-100'}`}>
              <Upload className={`w-6 h-6 ${dragging ? 'text-indigo-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="font-semibold text-gray-700">Upload an image</p>
              <p className="text-sm text-gray-500 mt-1">
                AI can analyze the image to understand the problem
              </p>
            </div>
            <p className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              PNG, JPG, WEBP — up to 10MB
            </p>
            {dragging && (
              <p className="text-indigo-600 font-semibold text-sm animate-bounce">Drop here!</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Image preview */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-200">
            <img
              src={preview}
              alt="Uploaded"
              className="w-full h-48 object-cover"
            />
            <button
              onClick={clearImage}
              className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Analyzing overlay */}
            {analyzing && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  <Scan className="w-6 h-6 text-white absolute inset-0 m-auto" />
                </div>
                <p className="text-white font-semibold text-sm">Vision AI Analyzing...</p>
                <div className="flex gap-1.5">
                  {['Detecting objects', 'Assessing severity', 'Classifying'].map((step, i) => (
                    <span key={i} className="text-white/70 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Simulated bounding box overlay */}
            {analysis && !analyzing && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute border-2 border-yellow-400 rounded-lg" style={{ top: '20%', left: '15%', width: '60%', height: '55%' }}>
                  <span className="absolute -top-6 left-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-t-lg">
                    {analysis.detectedObjects[0]}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Vision AI Analysis Result */}
          {analysis && !analyzing && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Scan className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-bold text-indigo-900 text-sm">Vision AI Analysis</p>
                  <p className="text-indigo-600 text-xs">Confidence: {analysis.confidence}%</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Detected Objects</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.detectedObjects.map((obj, i) => (
                      <span key={i} className="text-xs bg-white border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div>
                    <p className="text-xs text-gray-500">Severity</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${severityColor[analysis.severity]}`}>
                      {analysis.severity}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Suggested Category</p>
                    <p className="text-sm font-semibold text-indigo-700">{analysis.suggestedCategory}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
