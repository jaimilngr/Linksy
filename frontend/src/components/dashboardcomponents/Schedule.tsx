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

interface ScheduleItem {
  id: number;
  date: string; 
  time: string;
  service: Service;
  user: User | null;
  provider: Provider | null; 
}

export const Schedule = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get<ScheduleItem[]>(`${BACKEND_URL}/api/v1/service/schedule`, { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Fetched Schedule:', response.data); // Log the response for debugging
        setSchedule(response.data);
      } catch (err) {
        setError('Failed to fetch schedule data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  return (
    <div className="p-6 bg-background rounded-lg">
      <h3 className="text-2xl font-semibold mb-6">Schedule</h3>
      
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
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
