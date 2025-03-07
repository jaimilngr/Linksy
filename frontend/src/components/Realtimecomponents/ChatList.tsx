import { useEffect, useState } from "react";
import { getChatRooms } from "../../utils/supabase";

interface ChatRoom {
  id: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_at: string;
}

const ChatList = ({ onSelectRoom, user }: { onSelectRoom: (roomId: string) => void; user: string }) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchChatRooms = async () => {
      setLoading(true);
      const rooms = await getChatRooms(user);
      setChatRooms(rooms);
      setLoading(false);
    };

    fetchChatRooms();
  }, [user]);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="w-full p-4 bg-white shadow-lg rounded-lg dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Chats</h2>
      {loading ? (
        <div className="space-y-3">Loading...</div>
      ) : chatRooms.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No previous chats</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {chatRooms.map((room) => {
            // Only render the chat room if there's a last message
            if (!room.last_message?.trim()) return null;

            return (
              <li
                key={room.id}
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                onClick={() => onSelectRoom(room.id)}
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                  {getInitial(room.other_user_name)}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{room.other_user_name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {room.last_message?.trim()}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ChatList;
