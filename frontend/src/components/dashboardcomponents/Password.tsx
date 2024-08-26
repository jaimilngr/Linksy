import { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import Cookies from 'js-cookie';

export const Password = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    const token = Cookies.get('token');
    const role = Cookies.get('role');

    try {
      await axios.put(`${BACKEND_URL}/api/v1/user/update-password`, {
        currentPassword,
        newPassword,
        confirmPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          Role: `${role}`,
        },
      });

      setSuccessMessage('Password changed successfully');
      setError(null);
      // Clear input fields after successful update
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
      setSuccessMessage(null);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-6">Change Password</h3>
      <div className="space-y-4">
        {successMessage && (
          <p className="text-green-600 mb-4">{successMessage}</p>
        )}
        {error && (
          <p className="text-red-600 mb-4">{error}</p>
        )}
        <div>
          <label className="block text-sm">Current Password</label>
          <input
            type="password"
            placeholder="********"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm">New Password</label>
          <input
            type="password"
            placeholder="********"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm">Confirm New Password</label>
          <input
            type="password"
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Password
        </button>
      </div>
    </div>
  );
};
