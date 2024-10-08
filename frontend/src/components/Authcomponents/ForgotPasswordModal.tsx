import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from "../../config";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetState = () => {
    setEmail('');
    setEmailError('');
    setSuccessMessage(null);
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      setEmailError("Email is required");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/v1/user/request-password-reset`, { email });
      setSuccessMessage('A password reset link has been sent to your email.');
    } catch (error) {
      setEmailError('Failed to send password reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset state when the modal is closed
  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-black">Forgot Password</h2>
        {successMessage ? (
          <div>
            <p className="text-green-500 mb-4">{successMessage}</p>
            <button
              type="button"
              onClick={handleClose}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              className="w-full p-2 border border-gray-300 rounded mb-2 text-black"
            />
            {emailError && <p className="text-red-500">{emailError}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
              >
                {loading ? 'Sending...' : 'Submit'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="bg-gray-300 text-black px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
