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
  provider:provider
  user:user
}

interface provider {
  cancelLimit: number;
}
interface user {
  cancelLimit: number;
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
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [cancelReason, setCancelReason] = useState<string>('');
  const [customCancelReason, setCustomCancelReason] = useState<string>('');
  const [showDoneModal, setShowDoneModal] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null); 
  const [doneError, setDoneError] = useState<string | null>(null); 

  const totalLimit = 2;

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
            setError(`${error.response.data.error} `);

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
    setCurrentTicketId(ticketId);
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async () => {
    setCancelError(null); 

    if (!cancelReason && !customCancelReason) {
      setCancelError('Please provide a reason for canceling.');
      return;
    }
    if (cancelReason === 'Other' && !customCancelReason) {
      setCancelError("Please specify the reason for 'Other'."); 
      return; 
    }
  
    try {
      await axios.put(`${BACKEND_URL}/api/v1/service/ticket/cancel/${currentTicketId}`, { reason: cancelReason || customCancelReason }, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token') || ''}`,
        },
      });
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === currentTicketId ? { ...ticket, status: 'cancel' } : ticket
        )
      );
    } catch (error: any) {
      if (error.response) {
        setError(`${error.response.data.error} `);

      } else {
        setCancelError('Failed to cancel the ticket. Please try again later.');
      }
    } finally {
      setShowCancelModal(false);
      setCurrentTicketId(null);
      setCancelReason('');
      setCustomCancelReason('');
    }
  };



  const handleMarkAsDone = async (ticketId: string) => {
    setCurrentTicketId(ticketId);
    setShowDoneModal(true);
  };

  const handleDoneSubmit = async () => {
    setDoneError(null); // Reset done error message

    if (rating === null || rating < 1 || rating > 5) {
      setDoneError('Please provide a valid rating (1-5).');
      return;
    }
  
    if (comment.trim() === '') {
      setDoneError('Please provide a comment about your experience.');
      return;
    }
    
    try {
      await axios.put(`${BACKEND_URL}/api/v1/service/ticket/done/${currentTicketId}`, { rating, comment }, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token') || ''}`,
        },
      });
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === currentTicketId ? { ...ticket, status: 'done' } : ticket
        )
      );
    } catch (error: any) {
      if (error.response) {
        setError(`${error.response.data.error} `);

      } else {
        setDoneError('Failed to mark the ticket as done. Please try again later.');
      }
    } finally {
      setShowDoneModal(false);
      setCurrentTicketId(null);
      setRating(null);
      setComment('');
    }
  };

  const handleInputInteraction = () => {
    setCancelError(null); 
    setDoneError(null);   
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin flex justify-center items-center"></div>
      </div>
    );
  }

  const openTickets = tickets.filter((ticket) => ticket.status === 'pending'|| ticket.status === 'working');
  const previousTickets = tickets.filter((ticket) => ticket.status === 'done' || ticket.status === 'cancel' || ticket.status === 'rejected');

  return (
    <div className="px-4 py-8 max-w-3xl">
      <h3 className="text-3xl font-bold text-text mb-8 text-center">Your Service Tickets</h3>
      {error && <p className="text-red-600">{error}</p>}
      
      
      <div>
  <div className='text-left mb-5 text-red-500'>
    {tickets.length > 0 && (
      <h3>
        Remaining Cancel Limit: {totalLimit - (tickets[0].provider.cancelLimit || tickets[0].user?.cancelLimit || 0)}
      </h3>
    )}
  </div>    
</div>



  {/* Active Tickets Section */}
<div>
  <h4 className="text-2xl font-semibold mb-4 text-text">Active Tickets</h4>
  {openTickets.length === 0 ? (
    <p className="text-gray-500">No active service requests at the moment.</p>
  ) : (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {openTickets.map((ticket) => (
        <div
          key={ticket.id}
          className="p-6 mb-4 rounded-xl bg-[#5db87c99] backdrop-blur-lg shadow-lg border border-green-300 hover:shadow-xl transition-shadow duration-300"
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
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => handleCancelRequest(ticket.id)}
              className="bg-red-500 text-white px-4 py-2 rounded-md w-full hover:bg-red-600 transition-colors duration-300"
            >
              Cancel Request
            </button>
            {ticket.status !== 'pending' && (
              <button
                onClick={() => handleMarkAsDone(ticket.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md w-full hover:bg-blue-600 transition-colors duration-300"
              >
                Done
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</div>

      {/* Previous Tickets Section */}
      <div className="mt-12">
        <h4 className="text-2xl font-semibold mb-4 text-text">Previous Tickets</h4>
        {previousTickets.length === 0 ? (
          <p className="text-gray-500">No previous tickets yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {previousTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-6 mb-4 rounded-xl bg-white/50 backdrop-blur-md shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
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
              </div>
            ))}
          </div>
        )}
      </div>

{/* Cancel Modal */} 
{showCancelModal && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="bg-background border-black dark:border-gray-100 border p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">Cancel Ticket</h2>
      <p className="mb-2">Please provide a reason for canceling:</p>

      {/* Select for Cancellation Reasons */}
      <select
        value={cancelReason}
        onChange={(e) => {
          setCancelReason(e.target.value);
          handleInputInteraction();
        }}
        className="border border-gray-300 bg-background rounded-md p-2 w-full mb-4"
      >
        <option value="">Select a reason...</option>
        <option value="Service not needed anymore">Service not needed anymore</option>
        <option value="Scheduling conflicts">Scheduling conflicts</option>
        <option value="Poor experience">Poor experience</option>
        <option value="Other">Other</option>
      </select>

      {/* Conditional Input for Custom Reason */}
      {cancelReason === 'Other' && (
        <input
          type="text"
          placeholder="Specify other reason"
          value={customCancelReason}
          onChange={(e) => {
            setCustomCancelReason(e.target.value);
            handleInputInteraction(); 
          }}
          className="border bg-background border-gray-300 rounded-md p-2 w-full mb-4"
        />
      )}

      {/* Error Message */}
      {cancelError && <p className="text-red-600 mb-4">{cancelError}</p>}

      {/* Action Buttons */}
      <div className="flex justify-end">
        <button
          onClick={handleCancelSubmit}
          className="bg-red-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-red-600 transition-colors duration-300"
        >
          Submit Cancellation
        </button>
        <button
          onClick={() => setShowCancelModal(false)}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-300"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

      {/* Done Modal */}
      {showDoneModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-background border-black dark:border-gray-100 border p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Rate Your Experience</h2>
            <input
              type="number"
              placeholder="Rating (1-5)"
              value={rating === null ? '' : rating}
              onChange={(e) => {
                setRating(Number(e.target.value));
                handleInputInteraction(); 
              }}
              className="border light:border-black bg-background rounded-lg p-2 w-full mb-4"
              min="1"
              max="5"
            />
            <textarea
              placeholder="Comment"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                handleInputInteraction(); 
              }}
              className="border light:border-black bg-background rounded-lg p-2 w-full mb-4"
            />
            {doneError && <p className="text-red-600 mb-4">{doneError}</p>}
            <div className="flex justify-end">
              <button
                onClick={handleDoneSubmit}
                className="bg-green-500  text-white px-4 py-2 rounded-md mr-2 hover:bg-green-600 transition-colors duration-300"
              >
                Submit Rating
              </button>
              <button
                onClick={() => setShowDoneModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
