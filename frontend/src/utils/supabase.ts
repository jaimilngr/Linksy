import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL; 
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


/**
 * Create or get a chat room between two users
 */
export const getOrCreateChatRoom = async (
  user1Id: string,
  user1Name: string,
  user2Id: string,
  user2Name: string
) => {
  // Ensure consistent ordering regardless of who initiates the chat
  const [id1, name1, id2, name2] =
    user1Id < user2Id
      ? [user1Id, user1Name, user2Id, user2Name]
      : [user2Id, user2Name, user1Id, user1Name];

  const { data, error } = await supabase
    .from("chat_rooms")
    .upsert(
      [{ user1_id: id1, user1_name: name1, user2_id: id2, user2_name: name2 }],
      { onConflict: "user1_id,user2_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Error creating or fetching chat room:", error);
    return null;
  }

  return data;
};

/**
 * Send a message in a chat room
 */
export const sendMessage = async (roomId: string, senderId: string, senderName: string, message: string) => {
  // First update the last_message_at timestamp in the chat room
  const { error: updateError } = await supabase
    .from("chat_rooms")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", roomId);
  
  if (updateError) {
    console.error("Error updating last_message_at:", updateError);
  }

  const { error } = await supabase.from("chat_messages").insert([
    {
      room_id: roomId,
      sender_id: senderId,
      sender_name: senderName,
      message: message,
    },
  ]);

  if (error) {
    console.error("Error sending message:", error);
  }
};

/**
 * Get all chat rooms for a user
 */
export const getChatRooms = async (userId: string) => {
  const { data, error } = await supabase
    .from("chat_rooms")
    .select("*")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if (error) {
    console.error("Error fetching chat rooms:", error);
    return [];
  }

  // Format rooms to always show the OTHER user's info to the current user
  return data.map(room => {
    const isUser1 = room.user1_id === userId;
    return {
      ...room,
      other_user_id: isUser1 ? room.user2_id : room.user1_id,
      other_user_name: isUser1 ? room.user2_name : room.user1_name
    };
  });
};

/**
 * Get all messages for a chat room
 */
export const getChatMessages = async (roomId: string) => {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }

  return data;
};

/**
 * Listen for new chat messages in real-time
 */
export const subscribeToMessages = (roomId: string, callback: (message: any) => void) => {
  return supabase
    .channel(`chat_messages_${roomId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
};