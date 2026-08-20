import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle, MapPin, Navigation, User, Eye, EyeOff,
  ArrowRight, Loader2, ChevronDown
} from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import { ToastContainer, useToast } from '../components/Toast';
import type { ImageAnalysis } from '../types';

// ============================================================
// Report Civic Issue Page
// ============================================================

const locationOptions = [
  'Main Road, Near College Bus Stop',
  'City Market Area, Gandhi Nagar',
  'Residency Road, Near Post Office',
  'MG Road, Near Shopping Complex',
  'Park Road, Near City Park',
  'Brigade Road, Sector 4',
  'Lake View Colony, Sector 7',
  'Old Airport Junction',
  'Harmony Colony Entrance, Ring Road',
  'School Road, Near Government High School',
];

const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const { toasts, addToast, dismissToast } = useToast();

  const [formData, setFormData] = useState({
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    landmark: '',
    contactPreference: 'email',
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

  const handleImageUploaded = (_file: File, url: string, analysis?: ImageAnalysis) => {
    setImageUrl(url);
    if (analysis) setImageAnalysis(analysis);
    addToast('Image uploaded and analyzed by Vision AI!', 'success');
  };

  const handleGetLocation = () => {
    setLocating(true);
    // Simulate geolocation
    setTimeout(() => {
      const locations = [
        { lat: '12.9716', lng: '77.5946', name: locationOptions[0] },
        { lat: '12.9726', lng: '77.5956', name: locationOptions[1] },
        { lat: '12.9746', lng: '77.5976', name: locationOptions[3] },
      ];
      const picked = locations[Math.floor(Math.random() * locations.length)];
      setFormData((prev) => ({
        ...prev,
        latitude: picked.lat,
        longitude: picked.lng,
        location: picked.name,
      }));
      setLocating(false);
      addToast('Location detected!', 'success');
    }, 1500);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.description.trim()) {
      errs.description = 'Please describe the issue.';
    } else if (formData.description.trim().length < 20) {
      errs.description = 'Please provide a more detailed description (at least 20 characters).';
    }
    if (!formData.location.trim()) {
      errs.location = 'Please provide the location.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // Store form data in sessionStorage for the analysis page
    sessionStorage.setItem(
      'pendingComplaint',
      JSON.stringify({
        description: formData.description,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        landmark: formData.landmark,
        contactPreference: formData.contactPreference,
        isAnonymous: formData.isAnonymous,
        imageUrl,
      })
    );

    navigate('/analyze');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <AlertCircle className="w-4 h-4" />
            Report a Civic Issue
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Describe the Problem
          </h1>
          <p className="text-gray-500 mt-3">
            Our AI will analyze your report and route it to the right department automatically.
          </p>
        </div>

        <div className="space-y-6">
          {/* ── Description ──────────────────────────────────── */}
          <div className="card">
            <label className="label">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-indigo-600" />
                Describe the Problem *
              </span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the problem in your own words…&#10;&#10;Example: There is a large pothole near the main road beside the bus stop. Vehicles are struggling to pass and it is dangerous."
              rows={6}
              className={`input-field resize-none ${errors.description ? 'border-red-400 ring-2 ring-red-100' : ''}`}
            />
            <div className="flex items-center justify-between mt-2">
              {errors.description ? (
                <p className="text-xs text-red-500">{errors.description}</p>
              ) : (
                <p className="text-xs text-gray-400">Be specific — include what, where, and since when.</p>
              )}
              <p className="text-xs text-gray-400">{formData.description.length} chars</p>
            </div>
          </div>

          {/* ── Image Upload ─────────────────────────────────── */}
          <div className="card">
            <label className="label flex items-center gap-2">
              📸 Upload an Image (Optional)
            </label>
            <ImageUpload onImageUploaded={handleImageUploaded} />
          </div>

          {/* ── Location ─────────────────────────────────────── */}
          <div className="card">
            <label className="label flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Location *
            </label>

            {/* Use current location */}
            <button
              onClick={handleGetLocation}
              disabled={locating}
              className="w-full mb-4 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold py-3 rounded-xl transition-all"
            >
              {locating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              {locating ? 'Detecting location...' : 'Use Current Location'}
            </button>

            <div className="relative">
              <p className="text-xs text-gray-400 text-center mb-4">— or enter manually —</p>
            </div>

            {/* Location search */}
            <div className="space-y-3">
              <div>
                <label className="label text-xs">Location / Area Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="e.g. Main Road, Near Bus Stop"
                    list="location-suggestions"
                    className={`input-field ${errors.location ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                  />
                  <datalist id="location-suggestions">
                    {locationOptions.map((loc) => (
                      <option key={loc} value={loc} />
                    ))}
                  </datalist>
                </div>
                {errors.location && (
                  <p className="text-xs text-red-500 mt-1">{errors.location}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Latitude (optional)</label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => handleChange('latitude', e.target.value)}
                    placeholder="12.9716"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="label text-xs">Longitude (optional)</label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => handleChange('longitude', e.target.value)}
                    placeholder="77.5946"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              {/* Simulated map preview */}
              {(formData.latitude || formData.location) && (
                <div className="bg-gray-100 rounded-xl h-32 flex items-center justify-center border border-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 grid-bg opacity-50" />
                  <div className="relative flex flex-col items-center gap-2">
                    <div className="relative">
                      <div className="w-4 h-4 bg-red-500 rounded-full" />
                      <div className="absolute inset-0 w-4 h-4 bg-red-400 rounded-full map-pulse" />
                    </div>
                    <p className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-full shadow-sm">
                      📍 {formData.location || `${formData.latitude}, ${formData.longitude}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Optional Details ──────────────────────────────── */}
          <div className="card">
            <label className="label">Additional Details (Optional)</label>
            <div className="space-y-4">
              <div>
                <label className="label text-xs">Nearby Landmark</label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => handleChange('landmark', e.target.value)}
                  placeholder="e.g. Government Engineering College"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label text-xs">Contact Preference</label>
                <div className="relative">
                  <select
                    value={formData.contactPreference}
                    onChange={(e) => handleChange('contactPreference', e.target.value)}
                    className="input-field appearance-none pr-8"
                  >
                    <option value="email">Email notification</option>
                    <option value="sms">SMS notification</option>
                    <option value="none">No notification</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Anonymous toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {formData.isAnonymous ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-indigo-600" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Anonymous Report</p>
                    <p className="text-xs text-gray-500">Your identity will not be shared with authorities</p>
                  </div>
                </div>
                <button
                  onClick={() => handleChange('isAnonymous', !formData.isAnonymous)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${formData.isAnonymous ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${formData.isAnonymous ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Submit Button ─────────────────────────────────── */}
          <button
            onClick={handleSubmit}
            className="w-full btn-primary justify-center text-base py-4"
          >
            <span>🤖</span>
            Analyze with CivicResolve AI
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-xs text-gray-400 text-center">
            By submitting, you agree our AI will analyze and route your complaint to the appropriate department.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportIssuePage;
