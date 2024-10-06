import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Navbar } from "../components/Uicomponents/Navbar";
import { BACKEND_URL } from "../config";
import Cookies from "js-cookie";

interface Ticket {
  status: "working" | "pending" | "cancel" | "rejected";
}

interface Notification {
  id: number;
  content: string;
  ticket: Ticket;
  createdAt: string;
}

const statusStyles = {
  working:
    "bg-green-100 text-green-700 border-green-500 dark:bg-green-600 dark:text-white dark:border-green-800",
  pending:
    "bg-yellow-100 text-yellow-700 border-yellow-500 dark:bg-yellow-500 dark:text-white dark:border-yellow-700",
  cancel:
    "bg-red-100 text-red-700 border-red-500 dark:bg-red-500 dark:text-white dark:border-red-800",
  rejected:
    "bg-red-100 text-red-700 border-red-500 dark:bg-red-500 dark:text-white dark:border-red-800",
};

const Updates: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/service/notifications`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token") || ""}`,
          },
        }
      );

      const sortedNotifications = response.data.sort(
        (a: Notification, b: Notification) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(sortedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="p-6 flex flex-col items-center">
        <h1 className="text-3xl font-semibold mb-6">
          Updates and Notifications
        </h1>

        <div className="flex self-end">
          <button
            onClick={fetchNotifications}
            className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
              </div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-lg text-gray-500">No updates available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                className={`border-l-4 p-4 rounded-xl shadow-lg transition-all duration-300 ${
                  statusStyles[notification.ticket.status]
                } bg-opacity-70 backdrop-blur-lg`}
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-lg">{notification.content}</p>
                <span className="block mt-2 font-medium capitalize">
                  status: {notification.ticket.status}
                </span>
                <span className="block mt-2 text-sm text-gray-500 dark:text-white">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Updates;
