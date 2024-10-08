import React, { useState } from 'react'; 
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from "../../config";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"; 

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false); 
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const validatePasswords = () => {
    if (!newPassword || !confirmPassword) {
      return "Both fields are required";
    }
    if (newPassword.length < 6) {
      return "Password must be at least 6 characters long";
    }
    if (newPassword !== confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validatePasswords();
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/v1/user/reset-password`, {
        token: token,
        newPassword: newPassword,
      });

      setSuccessMessage("Password successfully reset! Redirecting to login...");
      setTimeout(() => {
        navigate('/signup');
      }, 3000);
    } catch (error: any) {
      const serverErrorMessage = error?.response?.data?.message || "Failed to reset password. Please try again.";
      setErrorMessage(serverErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#181424] bg-opacity-95">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md m-10">
        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
        {successMessage ? (
          <p className="text-green-500">{successMessage}</p>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div className="relative mb-2">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="New Password"
                className="w-full p-2 border border-gray-300 rounded"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError("");
                }}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Confirm Password Input */}
            <div className="relative mb-2">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                className="w-full p-2 border border-gray-300 rounded"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError("");
                }}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {passwordError && <p className="text-red-500">{passwordError}</p>}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
