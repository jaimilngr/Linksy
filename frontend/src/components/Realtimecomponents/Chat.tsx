import { useEffect, useState, useRef } from "react";
import { supabase, getOrCreateChatRoom } from "../../utils/supabase";

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  created_at: string;
}

const Chat = ({
  user1Id,
  user1Name,
  user2Id,
  user2Name,
  roomIdprop,
}: {
  user1Id?: string;
  user1Name?: string;
  user2Id?: string;
  user2Name?: string;
  roomIdprop?: string;
}) => {
  const [roomId, setRoomId] = useState<string | null>(roomIdprop || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // This is the key fix - we need to explicitly track the CURRENT user's ID
  // regardless of how the room is created in the database
  const currentUserId = user1Id ?? "";
 // The current user is ALWAYS user1Id in your component props
  
  // Fetch or create chat room
  useEffect(() => {
    if (roomIdprop) return;

    const fetchRoom = async () => {
      setIsLoading(true);
      if (user1Id && user1Name && user2Id && user2Name) {
        const room = await getOrCreateChatRoom(user1Id, user1Name, user2Id, user2Name);
        if (room) setRoomId(room.id);
      }      
      setIsLoading(false);
    };

    fetchRoom();
  }, [user1Id, user1Name, user2Id, user2Name , roomIdprop]);

  // Fetch messages
  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (!error) {
        setMessages(data || []);
      }
      setIsLoading(false);
    };

    fetchMessages();
  }, [roomId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`chat-room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !roomId) return;
    
    setIsLoading(true);
    
    // Always use the currentUserId when sending messages
    await supabase.from("chat_messages").insert([
      {
        room_id: roomId,
        sender_id: currentUserId, // Use the explicitly tracked currentUserId
        sender_name: currentUserId === user1Id ? user1Name : user2Name, // Set correct sender name
        message: newMessage,
      },
    ]);
    
    setNewMessage("");
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 w-full max-w-xl mx-auto bg-gray-50 dark:bg-gray-600 rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center text-white  font-bold">
            {user2Name ? user2Name.charAt(0).toUpperCase() : ""}
          </div>
          <h3 className="ml-2 text-lg font-semibold"> {user2Name}</h3>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 bg-green-500 rounded-full"></div>
        </div>
      </div>

      {/* Messages Container with fixed logic */}
      <div className="h-80 overflow-y-auto p-4 mb-4 bg-white dark:bg-gray-600  rounded-lg shadow-inner">
        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse text-gray-400">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            // THIS IS THE CRITICAL FIX: We use currentUserId instead of user1Id
            const isCurrentUser = msg.sender_id === currentUserId;
            
            return (
              <div key={msg.id} className={`mb-6 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-xs ${isCurrentUser ? 'text-right' : 'text-left'}`}>
             
                  
                  <div className="flex items-end">
                    {/* Avatar for other user (left side) */}
                    {!isCurrentUser && (
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                        {msg.sender_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div 
                      className={`px-4 py-2 break-words ${
                        isCurrentUser 
                          ? 'bg-blue-500 text-white rounded-tl-2xl rounded-bl-2xl rounded-tr-2xl text-left' 
                          : 'bg-gray-200 text-gray-800 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl text-left'
                      }`}
                    >
                      {msg.message}
                      <div className="text-xs mt-1 opacity-70">
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                    
                    {/* Avatar for current user (right side) */}
                    {isCurrentUser && (
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white ml-2">
                        {msg.sender_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                  </div>
                  <div className="text-xs font-medium mt-2">
                    {isCurrentUser ? `${msg.sender_name}` : msg.sender_name}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 p-1">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-grow p-2 focus:outline-none resize-none dark:bg-gray-700"
          rows={1}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !newMessage.trim()}
          className={`ml-2 p-2 rounded-full ${
            isLoading || !newMessage.trim() 
              ? 'bg-gray-200 text-gray-400' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Chat;