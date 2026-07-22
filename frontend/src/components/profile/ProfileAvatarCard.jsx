import React from 'react';
import { Mail, Calendar, Upload, Camera } from 'lucide-react';
import { getAvatarUrl } from '../../context/AuthContext';

export default function ProfileAvatarCard({
  user,
  selectedFile,
  previewUrl,
  isUploadingAvatar,
  fileInputRef,
  onFileChange,
  onAvatarUpload,
  onCancelAvatar,
}) {
  const currentDisplayAvatar = previewUrl || getAvatarUrl(user?.avatar);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
      {/* Avatar Display & File Trigger */}
      <div className="relative group">
        {currentDisplayAvatar ? (
          <img
            src={currentDisplayAvatar}
            alt="User Avatar"
            className="w-28 h-28 rounded-2xl object-cover border-2 border-blue-500/20 shadow-md"
          />
        ) : (
          <div className="w-28 h-28 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-3xl border-2 border-blue-500/20 shadow-md">
            {user?.firstName ? user.firstName[0] : 'U'}
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <Camera className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-semibold">Change Photo</span>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
        />
      </div>

      {/* User Info Details & Image Save Button */}
      <div className="space-y-2 text-center md:text-left flex-1">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {user?.firstName} {user?.lastName}
          </h2>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              user?.role === 'Admin'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
            }`}
          >
            {user?.role} Account
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-2">
          <Mail className="w-4 h-4 text-slate-400" />
          {user?.email}
        </p>
        {user?.lastLogin && (
          <p className="text-xs text-slate-400 flex items-center justify-center md:justify-start gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Last Login: {new Date(user.lastLogin).toLocaleString()}
          </p>
        )}

        {/* Action to confirm selected avatar upload */}
        {selectedFile && (
          <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
            <button
              type="button"
              onClick={onAvatarUpload}
              disabled={isUploadingAvatar}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-all shadow-xs disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploadingAvatar ? 'Uploading...' : 'Save New Profile Picture'}</span>
            </button>
            <button
              type="button"
              onClick={onCancelAvatar}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
