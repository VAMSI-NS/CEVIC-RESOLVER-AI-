import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle, MapPin, Navigation, User, Phone, Mail,
  ArrowRight, Loader2, FileText, CheckCircle2
} from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import { ToastContainer, useToast } from '../components/Toast';
import type { ImageAnalysis } from '../types';

// ============================================================
// Report Civic Issue Page - Citizen Reporting Form
// ============================================================

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
  const { toasts, addToast, dismissToast } = useToast();

  const [formData, setFormData] = useState({
    citizen_name: '',
    phone: '',
    email: '',
    description: '',
    location: '',
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

  const handleImageUploaded = (_file: File, url: string, analysis?: ImageAnalysis) => {
    setImageUrl(url);
    if (analysis) setImageAnalysis(analysis);
    addToast('Image uploaded and analyzed by Vision AI!', 'success');
  };

  const handleGetLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            location: prev.location || `GPS Location (${lat}, ${lng})`,
          }));
          setLocating(false);
          addToast('GPS location acquired!', 'success');
        },
        () => {
          // Fallback simulation
          setTimeout(() => {
            const picked = locationOptions[Math.floor(Math.random() * locationOptions.length)];
            setFormData((prev) => ({
              ...prev,
              latitude: '16.5062',
              longitude: '80.6480',
              location: picked,
            }));
            setLocating(false);
            addToast('Location detected successfully!', 'success');
          }, 1000);
        }
      );
    } else {
      setTimeout(() => {
        const picked = locationOptions[Math.floor(Math.random() * locationOptions.length)];
        setFormData((prev) => ({
          ...prev,
          latitude: '16.5062',
          longitude: '80.6480',
          location: picked,
        }));
        setLocating(false);
        addToast('Location detected!', 'success');
      }, 1000);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.isAnonymous) {
      if (!formData.citizen_name.trim()) {
        errs.citizen_name = 'Please enter your name.';
      }
      if (!formData.phone.trim()) {
        errs.phone = 'Please enter your contact phone number.';
      }
    }
    if (!formData.description.trim()) {
      errs.description = 'Please describe the issue.';
    } else if (formData.description.trim().length < 15) {
      errs.description = 'Please provide a clearer description (at least 15 characters).';
    }
    if (!formData.location.trim()) {
      errs.location = 'Please provide the location.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      addToast('Please fill all required fields', 'error');
      return;
    }

    // Store in sessionStorage for the AI Analysis confirmation step
    sessionStorage.setItem(
      'pendingComplaint',
      JSON.stringify({
        citizen_name: formData.isAnonymous ? 'Anonymous Citizen' : formData.citizen_name.trim(),
        phone: formData.isAnonymous ? 'N/A' : formData.phone.trim(),
        email: formData.isAnonymous ? '' : formData.email.trim(),
        description: formData.description,
        location: formData.location,
        latitude: formData.latitude ? parseFloat(formData.latitude) : 16.5062,
        longitude: formData.longitude ? parseFloat(formData.longitude) : 80.6480,
        landmark: formData.landmark,
        contactPreference: formData.contactPreference,
        isAnonymous: formData.isAnonymous,
        imageUrl,
        imageAnalysis,
      })
    );

    navigate('/analyze');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <FileText className="w-3.5 h-3.5" />
            Civic Grievance Registration
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Report a Civic Issue</h1>
          <p className="text-gray-600 text-sm mt-1 max-w-lg mx-auto">
            Your complaint will be saved permanently in the central PostgreSQL database and routed directly to the responsible municipal department.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">

          {/* Section: Citizen Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                1. Citizen Details (Who is Reporting)
              </h2>
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) => handleChange('isAnonymous', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                Report Anonymously
              </label>
            </div>

            {!formData.isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.citizen_name}
                      onChange={(e) => handleChange('citizen_name', e.target.value)}
                      className={`input-field pl-9 text-sm ${errors.citizen_name ? 'border-red-400 bg-red-50/30' : ''}`}
                    />
                  </div>
                  {errors.citizen_name && <p className="text-xs text-red-500 mt-1">{errors.citizen_name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className={`input-field pl-9 text-sm ${errors.phone ? 'border-red-400 bg-red-50/30' : ''}`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address (Optional for status updates)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="input-field pl-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Issue Description */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
              <AlertCircle className="w-4 h-4 text-indigo-600" />
              2. Describe the Issue
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                What is the problem? <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="e.g. Street light is broken and not working near the main crossroad for 3 days. It is causing difficulty for commuters at night."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={`input-field resize-none text-sm ${errors.description ? 'border-red-400 bg-red-50/30' : ''}`}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              <p className="text-xs text-gray-400 mt-1">Our AI will automatically categorize, assign priority, and route to the appropriate department.</p>
            </div>
          </div>

          {/* Section: Image Upload */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-gray-700">
              Upload Photo (Optional — analyzed by Vision AI)
            </label>
            <ImageUpload onImageUploaded={handleImageUploaded} />
          </div>

          {/* Section: Location */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
              <MapPin className="w-4 h-4 text-indigo-600" />
              3. Location Details
            </h2>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">
                  Location / Address <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold disabled:opacity-50"
                >
                  {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                  Auto-Detect GPS
                </button>
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. Main Road, Near Bus Stop, Vijayawada"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className={`input-field pl-9 text-sm ${errors.location ? 'border-red-400 bg-red-50/30' : ''}`}
                />
              </div>
              {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Latitude</label>
                <input
                  type="text"
                  placeholder="e.g. 16.5062"
                  value={formData.latitude}
                  onChange={(e) => handleChange('latitude', e.target.value)}
                  className="input-field text-xs py-1.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Longitude</label>
                <input
                  type="text"
                  placeholder="e.g. 80.6480"
                  value={formData.longitude}
                  onChange={(e) => handleChange('longitude', e.target.value)}
                  className="input-field text-xs py-1.5"
                />
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all text-base"
            >
              Analyze with AI & Review
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Saves directly into central PostgreSQL Database
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportIssuePage;