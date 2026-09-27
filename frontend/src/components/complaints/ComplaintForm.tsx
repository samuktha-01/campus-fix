import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Video,
  X,
  AlertCircle,
  MapPin,
  Tag,
  Layers,
  Info,
  Clock,
  Loader2,
} from 'lucide-react';
import { ticketApi } from '../../lib/api';
import { TicketSubmissionResult } from '../../types';

interface ComplaintFormProps {
  onSuccess: (result: TicketSubmissionResult) => void;
  onCancel?: () => void;
}

const COMMON_LOCATIONS = [
  'Hostel Block A',
  'Hostel Block C, Floor 3',
  'Central Library, 2nd Floor',
  'Engineering Lab 204',
  'Dining Hall / Mess',
  'Campus Transit Stop',
  'Academic Block 1',
];

const PREDEFINED_CATEGORIES = [
  { value: '', label: '🤖 Let AI determine automatically (Recommended)' },
  { value: 'Hostel Administration', label: 'Hostel Administration' },
  { value: 'IT & Network Infrastructure', label: 'IT & Network Infrastructure' },
  { value: 'Estate & Maintenance', label: 'Estate & Maintenance' },
  { value: 'Transport & Parking', label: 'Transport & Parking' },
  { value: 'Canteen & Dining Services', label: 'Canteen & Dining Services' },
];

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');

  // Media files
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Image selection handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Image file size must be under 20MB.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  // Video selection handler
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file (MP4, WEBM, MOV).');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('Video file size must be under 100MB.');
      return;
    }

    setVideoFile(file);
    setError(null);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeVideo = () => {
    setVideoFile(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // Form validation
  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = 'Issue title is required.';
    } else if (title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters.';
    }

    if (!description.trim()) {
      errors.description = 'Please describe the complaint in detail.';
    } else if (description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters.';
    }

    if (!location.trim()) {
      errors.location = 'Campus location is required.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);
    setSubmitStep(1);

    // Visual step progression
    const stepTimer1 = setTimeout(() => setSubmitStep(2), 500);
    const stepTimer2 = setTimeout(() => setSubmitStep(3), 1100);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('location', location.trim());
      if (category.trim()) formData.append('category', category.trim());
      if (subcategory.trim()) formData.append('subcategory', subcategory.trim());
      if (imageFile) formData.append('image', imageFile);
      if (videoFile) formData.append('video', videoFile);

      const result = await ticketApi.submitComplaint(formData);
      setSubmitStep(4);
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess(result);
      }, 400);
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsSubmitting(false);
      setSubmitStep(0);
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        'Failed to submit complaint. Please check your connection and try again.';
      setError(msg);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="mb-6 pb-6 border-b border-slate-800/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          Intelligent Autonomous Routing
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight font-heading">
          Submit Campus Complaint
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Provide your issue details below. Our AI engine will automatically analyze the complaint,
          detect safety hazards, identify the responsible department, check for duplicates, and calculate SLA deadlines.
        </p>
      </div>

      {/* AI Guarantee Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-slate-300 flex items-start gap-3">
        <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-indigo-300">Department Routing Automated: </span>
          You are <span className="underline decoration-indigo-400 font-semibold text-white">not forced</span> to manually determine which department handles your complaint. Our SmartCampus AI cross-references keyword signals and campus models to dispatch it to the right team instantly.
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Complaint Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
            Issue Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationErrors.title) setValidationErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="e.g., Water leaking continuously from ceiling in Hostel Block C washroom"
            className={`w-full bg-slate-950/80 border ${
              validationErrors.title ? 'border-rose-500' : 'border-slate-800'
            } rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition`}
          />
          {validationErrors.title && (
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {validationErrors.title}
            </p>
          )}
        </div>

        {/* Location with Quick Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
            Campus Location <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (validationErrors.location) setValidationErrors((prev) => ({ ...prev, location: '' }));
              }}
              placeholder="e.g., Hostel Block C, 3rd Floor Restroom"
              className={`w-full pl-10 bg-slate-950/80 border ${
                validationErrors.location ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition`}
            />
          </div>
          {validationErrors.location && (
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {validationErrors.location}
            </p>
          )}

          {/* Location quick chips */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Quick select:</span>
            {COMMON_LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocation(loc)}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Detailed Description <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] text-slate-500">{description.length} / 5000 characters</span>
          </div>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (validationErrors.description) setValidationErrors((prev) => ({ ...prev, description: '' }));
            }}
            placeholder="Describe the issue in detail: when did it start, how many students are affected, are there any safety risks like sparks or water overflow..."
            className={`w-full bg-slate-950/80 border ${
              validationErrors.description ? 'border-rose-500' : 'border-slate-800'
            } rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-y`}
          />
          {validationErrors.description && (
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {validationErrors.description}
            </p>
          )}
        </div>

        {/* Optional Category & Subcategory Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-indigo-400" />
              <span>Optional Category</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
            >
              {PREDEFINED_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-slate-900 text-slate-200">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              <span>Optional Subcategory</span>
            </label>
            <input
              type="text"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="e.g., Plumbing, Wi-Fi, Furniture (or leave blank)"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        {/* Media Attachments (Photo & Video) */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Upload className="h-3.5 w-3.5 text-indigo-400" />
            <span>Media Evidence (Image & Video)</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Image Upload Box */}
            <div className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/40 p-4 flex flex-col items-center justify-center text-center relative hover:border-indigo-500/50 transition">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-file-input"
              />
              {imagePreview ? (
                <div className="relative w-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-xl border border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">{imageFile?.name}</p>
                </div>
              ) : (
                <label htmlFor="image-file-input" className="cursor-pointer flex flex-col items-center space-y-2 py-3 w-full">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                      Upload Image Evidence
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WEBP up to 20MB</p>
                  </div>
                </label>
              )}
            </div>

            {/* Video Upload Box */}
            <div className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/40 p-4 flex flex-col items-center justify-center text-center relative hover:border-indigo-500/50 transition">
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
                id="video-file-input"
              />
              {videoFile ? (
                <div className="relative w-full flex flex-col items-center py-2">
                  <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400 mb-2">
                    <Video className="h-6 w-6" />
                  </div>
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute -top-2 -right-2 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <p className="text-xs font-semibold text-slate-200 truncate max-w-[200px]">{videoFile.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {(videoFile.size / (1024 * 1024)).toFixed(1)} MB video attached
                  </p>
                </div>
              ) : (
                <label htmlFor="video-file-input" className="cursor-pointer flex flex-col items-center space-y-2 py-3 w-full">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Video className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
                      Upload Video Clip
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">MP4, WEBM, MOV up to 100MB</p>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Submission Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span>Real-time SLA resolution target calculated instantly upon dispatch</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {submitStep === 1 && 'Analyzing complaint & safety...'}
                    {submitStep === 2 && 'Routing probable department...'}
                    {submitStep === 3 && 'Checking duplicate tickets...'}
                    {submitStep === 4 && 'Ticket Created!'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
