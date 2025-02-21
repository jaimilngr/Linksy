import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import Cookies from 'js-cookie';
import Chat from '../Realtimecomponents/Chat';

interface Service {
  name: string;
  price: number;
  category: string;
}

interface User {
  name: string | null;
  address?: string;
  contactNo?: string;
}

interface Provider {
  name: string | null;
  contactNo?: string;
}

interface ScheduleItem {
  id: number;
  date: string;
  time: string;
  service: Service;
  user: User | null;
  provider: Provider | null;
  serviceownedId: number;
  userId: number;
}

export const Schedule = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [chatUserId, setChatUserId] = useState<number | null>(null);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [ChatProviderName, setChatProviderName] = useState<string | null>(null);
  const [ChatUserName, setChatUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get<ScheduleItem[]>(`${BACKEND_URL}/api/v1/service/schedule`, { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSchedule(response.data);
      } catch (err) {
        setError('Failed to fetch schedule data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const handleOnChatClick = (item: ScheduleItem) => {
    if (!item.user || !item.service) {
      console.error("Missing user or provider information:", item);
      return;
    }
  
    setCurrentUserId(item.serviceownedId);
    setChatUserId(item.userId);
    setShowChatModal(true);
  
    // Ensure names are always non-null
    setChatUserName(item.user.name ?? "Unknown User");
    setChatProviderName(item.service.name ?? "Unknown Provider");
  };
  

  return (
    <div className="p-6 bg-background rounded-lg">
      <h3 className="text-2xl font-semibold mb-6">Scheduled Services</h3>
      
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin flex justify-center items-center"></div>
        </div>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="space-y-4">
          {schedule.length === 0 ? (
            <p className="text-gray-600">No schedule available.</p>
          ) : (
            schedule.map((item) => (
              <div
                key={item.id}
                className="border border-gray-300 rounded-lg p-4 dark:bg-[#384454] shadow-sm text-text"
              >
                <div className='flex'>
                  <h4 className="text-lg font-medium mb-2 mr-2"> {new Date(item.date).toLocaleDateString()}</h4>
                  <p className="text-lg "> - {item.time}</p>
                </div>
                <p className="text-lg ">Service: {item.service.name}</p>
                <p className="text-lg ">Price: ₹{item.service.price}</p>
                
                {item.user && (
                  <>
                    <p className="text-lg ">User: {item.user.name}</p>
                    <p className="text-lg ">Address: {item.user.address}</p>
                    <p className="text-lg ">Contact: {item.user.contactNo}</p>
                  </>
                )}
                
                {item.provider && (
                  <>
                    <p className="text-lg">Provider: {item.provider.name}</p>
                    <p className="text-lg ">Provider Contact: {item.provider.contactNo}</p>
                  </>
                )}

                  <button 
                    className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    onClick={() => handleOnChatClick(item)}
                  >
                    Chat
                  </button>
              
              </div>
            ))
          )}
        </div>
      )}



{showChatModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
  <div className="bg-white px-4 dark:bg-gray-600  rounded-lg shadow-lg sm:w-[600px]">
  <div className="flex justify-end">

<button
  className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
  onClick={() => setShowChatModal(false)}
  >
  X
</button>{" "}
  </div>
                {chatUserId && currentUserId && ChatUserName && ChatProviderName ? (
        <Chat 
          user1Id={chatUserId.toString()} 
          user2Id={currentUserId.toString()} 
          user1Name={ChatProviderName} 
          user2Name={ChatUserName} 
        />
      ) : (
        <p className="text-red-500">Error: Missing chat details</p>
      )}

    
    </div>
  </div>
)}

    </div>
  );
};
