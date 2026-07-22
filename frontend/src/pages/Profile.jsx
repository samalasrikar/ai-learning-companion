import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import ProfileAvatarCard from '../components/profile/ProfileAvatarCard';
import ProfileForm from '../components/profile/ProfileForm';

export default function Profile() {
  const { user, updateUserProfile, updateUserAvatar } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxSize) {
      toast.error('File size error', {
        description: 'Profile picture must be smaller than 2 MB.',
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid image format', {
        description: 'Only JPG, JPEG, PNG, and WEBP images are supported.',
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;
    setIsUploadingAvatar(true);
    try {
      await updateUserAvatar(selectedFile);
      toast.success('Profile picture updated successfully!');
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload profile picture.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({ firstName, lastName });
      toast.success('Profile details updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">Account Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">View and update your personal account settings</p>
      </div>

      {/* Profile Overview & Avatar Upload Component */}
      <ProfileAvatarCard
        user={user}
        selectedFile={selectedFile}
        previewUrl={previewUrl}
        isUploadingAvatar={isUploadingAvatar}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        onAvatarUpload={handleAvatarUpload}
        onCancelAvatar={() => {
          setSelectedFile(null);
          setPreviewUrl('');
        }}
      />

      {/* Edit Profile Form Component */}
      <ProfileForm
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        isSaving={isSaving}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
