import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import ChatList from "../components/Realtimecomponents/ChatList";
import Chat from "../components/Realtimecomponents/Chat";
import { Navbar } from "../components/Uicomponents/Navbar";
import { BACKEND_URL } from "../config";

const Messages = () => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          console.error("No token found, user is not authenticated.");
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${BACKEND_URL}/api/v1/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserId(response.data.id);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserId();
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-grow overflow-hidden">
        {/* Chat List */}
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-300 dark:border-gray-700">
          {isLoading ? (
            <p className="p-4 text-gray-500 dark:text-gray-400">Loading chats...</p>
          ) : userId ? (
            <ChatList onSelectRoom={setSelectedRoom} user={userId} />
          ) : (
            <p className="p-4 text-gray-500 dark:text-gray-400">No chats available</p>
          )}
        </div>

        {/* Chat Component - Visible only when a room is selected */}
        <div
          className={`flex-grow transition-all ${
            selectedRoom ? "block" : "hidden md:block"
          }`}
        >
          {selectedRoom ? (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <Chat roomIdprop={selectedRoom} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
