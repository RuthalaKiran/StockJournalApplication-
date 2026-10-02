import React, { useState } from 'react';
import {
  User,
  Lock,
  Sliders,
  Save,
  Sun,
  Moon,
  LogOut,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { useToast } from '../components/common/Toast';

export const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const { isDark, toggleTheme, theme } = useTheme();
  const toast = useToast();

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Preferences State
  const [defaultCurrency, setDefaultCurrency] = useState(
    user?.preferences?.defaultCurrency || 'USD'
  );
  const [defaultRiskReward, setDefaultRiskReward] = useState(
    user?.preferences?.defaultRiskReward || '1:2'
  );
  const [prefLoading, setPrefLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    try {
      setProfileLoading(true);
      const res = await authService.updateProfile({
        name: name.trim(),
        avatar: avatar.trim(),
      });

      if (res.success && res.data.user) {
        updateUser(res.data.user);
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });

      if (res.success) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    try {
      setPrefLoading(true);
      const res = await authService.updateProfile({
        preferences: {
          defaultCurrency,
          defaultRiskReward,
          theme,
        },
      });

      if (res.success && res.data.user) {
        updateUser(res.data.user);
        toast.success('Preferences saved successfully');
      }
    } catch (err) {
      toast.error('Failed to save preferences');
    } finally {
      setPrefLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="pb-2 border-b border-gray-200 dark:border-[#1f293d]">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Settings & Preferences</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Manage your trader profile, authentication security, and terminal defaults
        </p>
      </div>

      {/* Profile Section */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm space-y-4 sm:space-y-5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-200 dark:border-[#1f293d]">
          <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Trader Profile
          </h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Email Address (Account Identifier)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-[#0a0e17]/60 border border-gray-200 dark:border-[#1f293d] text-gray-500 dark:text-gray-400 text-xs cursor-not-allowed select-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={profileLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{profileLoading ? 'Saving...' : 'Update Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Terminal Preferences */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm space-y-4 sm:space-y-5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-200 dark:border-[#1f293d]">
          <Sliders className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Terminal Preferences
          </h2>
        </div>

        <form onSubmit={handleUpdatePreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Default Currency
              </label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Default Risk / Reward Target
              </label>
              <input
                type="text"
                value={defaultRiskReward}
                onChange={(e) => setDefaultRiskReward(e.target.value)}
                placeholder="1:2"
                className="w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-cyan-600 dark:text-cyan-400 font-mono font-bold text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Terminal Theme
              </label>
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs flex items-center justify-between hover:border-cyan-500/50 transition"
              >
                <span>{isDark ? 'Dark Terminal (Default)' : 'Light Theme'}</span>
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-cyan-600" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={prefLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{prefLoading ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f293d] shadow-sm space-y-4 sm:space-y-5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-200 dark:border-[#1f293d]">
          <Lock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Security & Authentication
          </h2>
        </div>

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-600 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                className="w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                required
                className="w-full py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#0a0e17] border border-gray-300 dark:border-[#1f293d] text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold text-xs shadow-sm transition disabled:opacity-60"
            >
              <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{passwordLoading ? 'Updating...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Sign Out Card */}
      <div className="p-4 sm:p-6 rounded-2xl bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Sign Out of Terminal Session</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            End your authenticated session on this computer
          </p>
        </div>
        <button
          onClick={logout}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
