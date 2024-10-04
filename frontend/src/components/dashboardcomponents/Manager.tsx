import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import Cookies from 'js-cookie';

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

interface ManagerItem {
  id: number;
  date: string; 
  time: string;
  service: Service;
  user: User | null;
  provider: Provider | null; 
}

export const Manager = () => {
  const [manager, setManager] = useState<ManagerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentAction, setCurrentAction] = useState<'accept' | 'reject' | null>(null);
  const [currentTicketId, setCurrentTicketId] = useState<number | null>(null);

  const fetchManager = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get<ManagerItem[]>(`${BACKEND_URL}/api/v1/service/manage`, { 
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetched Manager:', response.data);
      setManager(response.data);
    } catch (err) {
      setError('Failed to fetch Manager data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManager();
  }, []);

  const handleAccept = (id: number) => {
    setCurrentAction('accept');
    setCurrentTicketId(id);
    setIsModalOpen(true);
  };

  const handleReject = (id: number) => {
    setCurrentAction('reject');
    setCurrentTicketId(id);
    setIsModalOpen(true);
  };

  const confirmAction = async () => {
    if (currentTicketId === null || currentAction === null) return;

    try {
      const token = Cookies.get('token');
      const url = currentAction === 'accept'
        ? `${BACKEND_URL}/api/v1/service/ticket/working/${currentTicketId}`
        : `${BACKEND_URL}/api/v1/service/ticket/rejected/${currentTicketId}`;
      
      await axios.put(url, {}, { 
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`${currentAction === 'accept' ? 'Accepted' : 'Rejected'} ticket with ID: ${currentTicketId}`);
      fetchManager(); // Reload the manager data
    } catch (error) {
      console.error(`Error ${currentAction === 'accept' ? 'accepting' : 'rejecting'} ticket:`, error);
    } finally {
      setIsModalOpen(false);
      setCurrentAction(null);
      setCurrentTicketId(null);
    }
  };

  return (
    <div className="p-6 bg-background rounded-lg">
      <h3 className="text-2xl font-semibold mb-6">Manage your Tickets</h3>
      
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin flex justify-center items-center"></div>
        </div>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="space-y-4">
          {manager.length === 0 ? (
            <p className="text-gray-600">No tickets available.</p>
          ) : (
            manager.map((item) => (
              <div
                key={item.id}
                className="border border-gray-300 rounded-lg p-4 dark:bg-[#384454] bg-opacity-50 shadow-sm text-text"
                style={{ backgroundColor: 'rgba(144, 238, 144, 0.2)' }} 
              >
                <div className='flex'>
                  <h4 className="text-lg font-medium mb-2 mr-2"> {new Date(item.date).toLocaleDateString()}</h4>
                  <p className="text-lg"> - {item.time}</p>
                </div>
                <p className="text-lg">Service: {item.service.name}</p>
                <p className="text-lg">Price: ₹{item.service.price}</p>

                {item.user && (
                  <>
                    <p className="text-lg">User: {item.user.name}</p>
                    <p className="text-lg">Address: {item.user.address}</p>
                    <p className="text-lg">Contact: {item.user.contactNo}</p>
                  </>
                )}

                {item.provider && (
                  <>
                    <p className="text-lg">Provider: {item.provider.name}</p>
                    <p className="text-lg ">Provider Contact: {item.provider.contactNo}</p>
                  </>
                )}

                {/* Accept and Reject buttons */}
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={() => handleAccept(item.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(item.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-300"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-background rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">{currentAction === 'accept' ? 'Confirm Accept' : 'Confirm Reject'}</h2>
            <p className="mb-6">
              Are you sure you want to {currentAction === 'accept' ? 'accept' : 'reject'} this ticket?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
