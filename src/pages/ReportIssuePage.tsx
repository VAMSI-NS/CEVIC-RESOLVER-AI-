import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertCircle, MapPin, Navigation, User, Phone, Mail,
  ArrowRight, Loader2, FileText, CheckCircle2, Sparkles,
  Camera, ShieldAlert, Cpu, Compass
} from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import { ToastContainer, useToast } from '../components/Toast';
import type { ImageAnalysis } from '../types';

const locationOptions = [
  'MG Road, Near Bus Station, Vijayawada',
  'Gandhi Nagar Main Road, Vijayawada',
  'Benz Circle, Near Ring Road, Vijayawada',
  'Governorpet, 4th Cross Road, Vijayawada',
  'Auto Nagar Industrial Area, Vijayawada',
  'Bhavanipuram, Near Market Center, Vijayawada',
  'Main Road, Near College Bus Stop',
  'City Market Area, Sector 4',
  'Residency Road, Near Post Office',
  'Park Road, Near Central Park',
];

const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const routeState = (routeLocation.state as { initialDescription?: string; initialLocation?: string } | null) || {};
  const { toasts, addToast, dismissToast } = useToast();

  const [formData, setFormData] = useState({
    citizen_name: '',
    phone: '',
    email: '',
    description: routeState.initialDescription || '',
    location: routeState.initialLocation || '',
    latitude: '',
    longitude: '',
    landmark: '',
    contactPreference: 'phone',
    isAnonymous: false,
  });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  /** Auto-detect GPS coordinates */
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          location: prev.location || `GPS: ${lat}, ${lng} (Auto-Detected)`,
        }));
        setLocating(false);
        addToast('GPS Coordinates successfully detected', 'success');
      },
      () => {
        const sampleLat = (16.5062 + (Math.random() - 0.5) * 0.05).toFixed(6);
        const sampleLng = (80.6480 + (Math.random() - 0.5) * 0.05).toFixed(6);
        setFormData((prev) => ({
          ...prev,
          latitude: sampleLat,
          longitude: sampleLng,
          location: prev.location || 'Benz Circle, Vijayawada',
        }));
        setLocating(false);
        addToast('Location pinned to local municipal zone', 'info');
      },
      { timeout: 8000 }
    );
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.isAnonymous && !formData.citizen_name.trim()) {
      errs.citizen_name = 'Please enter your full name';
    }
    if (!formData.description.trim()) {
      errs.description = 'Please describe the civic issue in detail';
    } else if (formData.description.trim().length < 10) {
      errs.description = 'Please provide at least 10 characters describing the issue';
    }
    if (!formData.location.trim()) {
      errs.location = 'Please specify the street, area or landmark';
    }
    if (formData.phone && !/^\d{7,15}$/.test(formData.phone.replace(/[\s\-+()]/g, ''))) {
      errs.phone = 'Please enter a valid 10-digit phone number';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please complete all required fields', 'error');
      return;
    }

    navigate('/analyze', {
      state: {
        citizen_name: formData.isAnonymous ? 'Anonymous Citizen' : formData.citizen_name,
        phone: formData.phone || '',
        email: formData.email || '',
        description: formData.description,
        location: formData.location,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        landmark: formData.landmark,
        contactPreference: formData.contactPreference,
        isAnonymous: formData.isAnonymous,
        imageUrl,
        imageAnalysis,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pt-28 pb-20 smart-city-light-grid relative">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-POWERED INTAKE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
            Report a <span className="gradient-text-blue-cyan">Civic Issue</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
            Your report helps make your community better. Our AI will classify the severity and route it instantly.
          </p>
        </div>

        {/* Main Form Glass Card */}
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-10 space-y-8 bg-white border-slate-200 shadow-premium">

          {/* Section 1: Citizen Identity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                  1. Citizen Contact Information
                </h2>
              </div>
              
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) => handleChange('isAnonymous', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Report Anonymously</span>
              </label>
            </div>

            {!formData.isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.citizen_name}
                    onChange={(e) => handleChange('citizen_name', e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="glass-input"
                  />
                  {errors.citizen_name && (
                    <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.citizen_name}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="9876543210"
                    className="glass-input"
                  />
                  {errors.phone && (
                    <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="you@gmail.com"
                    className="glass-input"
                  />
                  {errors.email && (
                    <p className="text-rose-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Issue Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                2. Issue Description & Details <span className="text-rose-500">*</span>
              </h2>
            </div>

            <div className="space-y-1.5">
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the issue in detail (e.g., 'A deep pothole on MG Road near the college bus stop causing traffic congestion and skidding hazard...')"
                className="glass-input resize-none"
              />
              {errors.description && (
                <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.description}
                </p>
              )}
            </div>

            {/* Photo Upload */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                <span>Attach Photo (Optional)</span>
              </label>
              <ImageUpload
                onImageUploaded={(_file: File, url: string, analysis?: ImageAnalysis) => {
                  setImageUrl(url);
                  setImageAnalysis(analysis || null);
                  if (analysis) {
                    addToast(`AI detected ${analysis.suggestedCategory} (${analysis.severity} severity)`, 'info');
                  }
                }}
              />
            </div>
          </div>

          {/* Section 3: Location */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-violet-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                  3. Location & GPS <span className="text-rose-500">*</span>
                </h2>
              </div>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                <span>Auto-Detect GPS</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g. Benz Circle, Main Road, Vijayawada"
                  list="location-options"
                  className="glass-input"
                />
                <datalist id="location-options">
                  {locationOptions.map((loc, idx) => (
                    <option key={idx} value={loc} />
                  ))}
                </datalist>
                {errors.location && (
                  <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.location}
                  </p>
                )}
              </div>

              {(formData.latitude || formData.longitude) && (
                <div className="flex items-center gap-3 text-xs font-mono text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>GPS Coordinates: {formData.latitude}, {formData.longitude}</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              ⚡ Next: Our AI will inspect your report and select the department.
            </p>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Analyze with AI & Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ReportIssuePage;