import { useState } from "react";
import ChatList from "../components/Realtimecomponents/ChatList";
import Chat from "../components/Realtimecomponents/Chat";
import { Navbar } from "../components/Uicomponents/Navbar";

const Messages = () => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Chat Container */}
      <div className="flex flex-grow overflow-hidden relative">
        {/* Chat List */}
        <div
          className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-300 dark:border-gray-700 transition-transform transform ${
            selectedRoom ? "translate-x-[-100%] md:translate-x-0 absolute md:relative" : "translate-x-0"
          }`}
        >
          <ChatList
            onSelectRoom={(roomId) => setSelectedRoom(roomId)}
            user="07e39ee4-affb-48da-8ba4-12f47c7b4c52"
          />
        </div>

        {/* Chat Component - Visible only when a room is selected */}
        <div
          className={`flex-grow transition-all ${
            selectedRoom ? "block" : "hidden md:block"
          }`}
        >
          {selectedRoom ? (
            <div className="h-full justify-center flex flex-col">
              {/* Back Button for Mobile */}
              <button
                onClick={() => setSelectedRoom(null)}
                className="md:hidden p-2 flex items-center gap-2 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700"
              >
                {/* Custom SVG for back icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                  />
                </svg>
                Back to chats
              </button>
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
