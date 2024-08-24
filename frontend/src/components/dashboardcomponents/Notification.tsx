import React from 'react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: string[];
}

 const Notification: React.FC<NotificationsModalProps> = ({ isOpen, onClose, notifications }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <ul className="space-y-2">
          {notifications.length === 0 ? (
            <li>No notifications</li>
          ) : (
            notifications.map((notification, index) => (
              <li key={index} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700">
                {notification}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Notification;