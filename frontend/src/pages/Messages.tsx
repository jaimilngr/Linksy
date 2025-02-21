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
      <div className="flex flex-grow overflow-hidden">
        {/* Chat List */}
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-300 dark:border-gray-700">
          <ChatList
            onSelectRoom={(roomId) => setSelectedRoom(roomId)}
            user="f865829b-664f-4de5-8c93-ba2d42212479"
          />
        </div>

        {/* Chat Component - Visible only when a room is selected */}
        <div className={`flex-grow transition-all ${selectedRoom ? "block" : "hidden md:block"}`}>
          {selectedRoom ? (
                        <div className="h-full  flex items-center justify-center text-gray-500 dark:text-gray-400">
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
