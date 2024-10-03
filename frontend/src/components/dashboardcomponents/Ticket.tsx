import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import Cookies from 'js-cookie';

interface Ticket {
  id: string;
  status: string;
  service: {
    name: string;
  };
  date: string;
  time: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const Ticket = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get(`${BACKEND_URL}/api/v1/service/ticket`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTickets(response.data);
      } catch (error: any) {
        if (error.response) {
          if (error.response.status === 404) {
            setError('Tickets not found. Please check the endpoint.');
          } else if (error.response.status === 401) {
            setError('Unauthorized access. Please log in.');
          } else {
            setError(`Error: ${error.response.status} - ${error.response.data.message}`);
          }
        } else if (error.request) {
          setError('No response from the server. Please try again later.');
        } else {
          setError('Request setup error. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleCancelRequest = async (ticketId: string) => {
    try {
      await axios.put(`${BACKEND_URL}/api/v1/service/tickets/${ticketId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token') || ''}`,
        },
      });
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: 'closed' } : ticket
        )
      );
    } catch (error: any) {
      if (error.response) {
        setError(`Error: ${error.response.status} - ${error.response.data.message}`);
      } else {
        setError('Failed to cancel the ticket. Please try again later.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin flex justify-center items-center"></div>
      </div>
    );
  }

  // Filter open and closed tickets
  const openTickets = tickets.filter((ticket) => ticket.status === 'open');
  const closedTickets = tickets.filter((ticket) => ticket.status === 'closed');

  return (
    <div className="px-4 py-8 max-w-3xl">
      <h3 className="text-3xl font-bold text-text mb-8 text-center">Your Service Tickets</h3>
      {error && <p className="text-red-600">{error}</p>} 

      {/* Open Tickets Section */}
      <div>
        <h4 className="text-2xl font-semibold mb-4 text-text">Open Tickets</h4>
        {openTickets.length === 0 ? (
          <p className="text-gray-500">No open service requests at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {openTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-6 mb-4 rounded-xl bg-green-100/60 backdrop-blur-lg shadow-lg border border-green-300 hover:shadow-xl transition-shadow duration-300"
              >
                <p className="text-lg font-semibold text-text">
                  <strong>Status:</strong> {ticket.status}
                </p>
                <p className="text-lg text-text">
                  <strong>Service:</strong> {ticket.service.name}
                </p>
                <p className="text-text">
                  <strong>Date:</strong> {formatDate(ticket.date)}
                </p>
                <p className="text-text">
                  <strong>Time:</strong> {ticket.time}
                </p>
                <button
                  onClick={() => handleCancelRequest(ticket.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md mt-4 w-full hover:bg-red-600 transition-colors duration-300"
                >
                  Cancel Request
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Closed Tickets Section */}
      <div className="mt-12">
        <h4 className="text-2xl font-semibold mb-4 text-text">Closed Tickets</h4>
        {closedTickets.length === 0 ? (
          <p className="text-gray-500">No closed tickets yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {closedTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-6 mb-4 rounded-xl bg-white/50 backdrop-blur-md shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <p className="text-lg font-semibold text-gray-800">
                  <strong>Status:</strong> {ticket.status}
                </p>
                <p className="text-lg text-text">
                  <strong>Service:</strong> {ticket.service.name}
                </p>
                <p className="text-text">
                  <strong>Date:</strong> {formatDate(ticket.date)}
                </p>
                <p className="text-text">
                  <strong>Time:</strong> {ticket.time}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
