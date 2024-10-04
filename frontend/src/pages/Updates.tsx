import React, { useEffect, useState } from 'react'; 
import { motion } from 'framer-motion';
import axios from 'axios';
import { Navbar } from '../components/Uicomponents/Navbar';
import { BACKEND_URL } from '../config';
import Cookies from 'js-cookie';

interface Ticket {
  status: 'working' | 'pending' | 'cancel' | 'rejected';
}

interface Notification {
  id: number;
  content: string; 
  ticket: Ticket; 
  createdAt: string;
}

const statusStyles = {
  working: 'bg-green-100 text-green-700 border-green-500 dark:bg-green-600 dark:text-white dark:border-green-800',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-500 dark:bg-yellow-500 dark:text-white dark:border-yellow-700',
  cancel: 'bg-red-100 text-red-700 border-red-500 dark:bg-red-500 dark:text-white dark:border-red-800',
  rejected: 'bg-red-100 text-red-700 border-red-500 dark:bg-red-500 dark:text-white dark:border-red-800',
};


const Updates: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/v1/service/notifications`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token") || ""}`,
            },
          }
        );

        const sortedNotifications = response.data.sort((a: Notification, b: Notification) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setNotifications(sortedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="p-6 flex flex-col items-center">
        <h1 className="text-3xl font-semibold mb-6">Updates and Notifications</h1>
        
        {notifications.length === 0 ? (
          <p className="text-lg text-gray-500">No updates available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                className={`border-l-4 p-4 rounded-xl shadow-lg transition-all duration-300 ${statusStyles[notification.ticket.status]} bg-opacity-70 backdrop-blur-lg`}
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-lg">{notification.content}</p> 
                <span className="block mt-2 font-medium capitalize">status: {notification.ticket.status}</span>
                <span className="block mt-2 text-sm text-gray-500 dark:text-white">{new Date(notification.createdAt).toLocaleString()}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Updates;
