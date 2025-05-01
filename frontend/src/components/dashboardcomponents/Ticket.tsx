import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import Cookies from "js-cookie";
import Chat from "../Realtimecomponents/Chat";

interface Ticket {
  id: string;
  status: string;
  service: {
    name: string;
  };
  date: string;
  time: string;
  provider: provider;
  user: user;
  userId: string;
  serviceownedId: string;
}

interface provider {
  cancelLimit: number;
}
interface user {
  cancelLimit: number;
  name: string;
}

interface SortOptions {
  status: string;
  dateFrom: string;
  dateTo: string;
  enableDateFilter: boolean;
}

// Payment information interface
interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const Ticket = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [cancelReason, setCancelReason] = useState<string>("");
  const [customCancelReason, setCustomCancelReason] = useState<string>("");
  const [showDoneModal, setShowDoneModal] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [doneError, setDoneError] = useState<string | null>(null);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // New payment related state
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: "",
  });
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Sort states
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    status: "",
    dateFrom: "",
    dateTo: "",
    enableDateFilter: false,
  });
  const [appliedSort, setAppliedSort] = useState<SortOptions>({
    status: "",
    dateFrom: "",
    dateTo: "",
    enableDateFilter: false,
  });

  const totalLimit = 2;

  const fetchTickets = async (options = appliedSort) => {
    try {
      const token = Cookies.get("token");

      // Build query parameters based on applied sort options
      const params = new URLSearchParams();
      if (options.status) params.append("status", options.status);
      if (options.enableDateFilter) {
        if (options.dateFrom) params.append("dateFrom", options.dateFrom);
        if (options.dateTo) params.append("dateTo", options.dateTo);
      }

      const queryString = params.toString() ? `?${params.toString()}` : "";

      const response = await axios.get(
        `${BACKEND_URL}/api/v1/service/ticket${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTickets(response.data);
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          setError("Tickets not found. Please check the endpoint.");
        } else if (error.response.status === 401) {
          setError("Unauthorized access. Please log in.");
        } else {
          setError(`${error.response.data.error} `);
        }
      } else if (error.request) {
        setError("No response from the server. Please try again later.");
      } else {
        setError("Request setup error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOnChatClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowChatModal(true);
  };

  const handleCancelRequest = async (ticketId: string) => {
    setCurrentTicketId(ticketId);
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async () => {
    setCancelError(null);

    if (!cancelReason && !customCancelReason) {
      setCancelError("Please provide a reason for canceling.");
      return;
    }
    if (cancelReason === "Other" && !customCancelReason) {
      setCancelError("Please specify the reason for 'Other'.");
      return;
    }

    try {
      await axios.put(
        `${BACKEND_URL}/api/v1/service/ticket/cancel/${currentTicketId}`,
        { reason: cancelReason || customCancelReason },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token") || ""}`,
          },
        }
      );
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === currentTicketId
            ? { ...ticket, status: "cancel" }
            : ticket
        )
      );
      await fetchTickets();
    } catch (error: any) {
      if (error.response) {
        setError(`${error.response.data.error} `);
      } else {
        setCancelError("Failed to cancel the ticket. Please try again later.");
      }
    } finally {
      setShowCancelModal(false);
      setCurrentTicketId(null);
      setCancelReason("");
      setCustomCancelReason("");
    }
  };

  // New handler for mark as done - shows payment modal first
  const handleMarkAsDone = (ticketId: string) => {
    setCurrentTicketId(ticketId);
    setShowPaymentModal(true); // Show payment modal first
  };

  // Handle payment form input changes
  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: value
    }));
    setPaymentError(null);
  };

  // Handle demo payment submission
  const handlePaymentSubmit = () => {
    setPaymentError(null);
    
    // Basic validation
    if (!paymentInfo.cardNumber || paymentInfo.cardNumber.length < 16) {
      setPaymentError("Please enter a valid card number (16 digits)");
      return;
    }
    
    if (!paymentInfo.expiryDate || !paymentInfo.expiryDate.includes('/')) {
      setPaymentError("Please enter a valid expiry date (MM/YY)");
      return;
    }
    
    if (!paymentInfo.cvv || paymentInfo.cvv.length < 3) {
      setPaymentError("Please enter a valid CVV (3 digits)");
      return;
    }
    
    if (!paymentInfo.name) {
      setPaymentError("Please enter the cardholder name");
      return;
    }

    // Close payment modal and show rating modal
    setShowPaymentModal(false);
    setShowDoneModal(true);
    
    // Reset payment info
    setPaymentInfo({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      name: ""
    });
  };

  const handleDoneSubmit = async () => {
    setDoneError(null); // Reset done error message

    if (rating === null || rating < 1 || rating > 5) {
      setDoneError("Please provide a valid rating (1-5).");
      return;
    }

    if (comment.trim() === "") {
      setDoneError("Please provide a comment about your experience.");
      return;
    }

    try {
      await axios.put(
        `${BACKEND_URL}/api/v1/service/ticket/done/${currentTicketId}`,
        { rating, comment },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token") || ""}`,
          },
        }
      );
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === currentTicketId ? { ...ticket, status: "done" } : ticket
        )
      );
      await fetchTickets();
    } catch (error: any) {
      if (error.response) {
        setError(`${error.response.data.error} `);
      } else {
        setDoneError(
          "Failed to mark the ticket as done. Please try again later."
        );
      }
    } finally {
      setShowDoneModal(false);
      setCurrentTicketId(null);
      setRating(null);
      setComment("");
    }
  };

  const handleInputInteraction = () => {
    setCancelError(null);
    setDoneError(null);
    setPaymentError(null);
  };

  const handleSortChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSortOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleDateFilter = () => {
    setSortOptions((prev) => ({
      ...prev,
      enableDateFilter: !prev.enableDateFilter,
    }));
  };

  const applySorting = () => {
    setAppliedSort(sortOptions);
    fetchTickets(sortOptions);
    setShowSortDropdown(false);
  };

  const resetFilters = () => {
    const resetOptions = {
      status: "",
      dateFrom: "",
      dateTo: "",
      enableDateFilter: false,
    };
    setSortOptions(resetOptions);
    setAppliedSort(resetOptions);
    fetchTickets(resetOptions);
    setShowSortDropdown(false);
  };

  // Check if payment form is complete and valid to enable pay button
  const isPaymentFormComplete = () => {
    return (
      paymentInfo.cardNumber.length >= 16 &&
      paymentInfo.expiryDate.includes('/') &&
      paymentInfo.cvv.length >= 3 &&
      paymentInfo.name.trim() !== ''
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin flex justify-center items-center"></div>
      </div>
    );
  }

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "pending" || ticket.status === "working"
  );
  const previousTickets = tickets.filter(
    (ticket) =>
      ticket.status === "done" ||
      ticket.status === "cancel" ||
      ticket.status === "rejected" ||
      ticket.status === "expired"
  );

  return (
    <div className="px-4 py-8 max-w-3xl">
      <h3 className="text-3xl font-bold text-text mb-8 text-center">
        Your Service Tickets
      </h3>
      {error && <p className="text-red-600">{error}</p>}

      <div>
        <div className="text-left mb-5 text-red-500">
          {tickets.length > 0 && (
            <h3>
              Remaining Cancel Limit:{" "}
              {totalLimit -
                ((tickets[0].provider?.cancelLimit ?? 0) ||
                  (tickets[0].user?.cancelLimit ?? 0))}
            </h3>
          )}
        </div>
      </div>

      {/* Active Tickets Section */}
      <div>
        <h4 className="text-2xl font-semibold mb-4 text-text">
          Active Tickets
        </h4>
        {openTickets.length === 0 ? (
          <p className="text-gray-500">
            No active service requests at the moment.
          </p>
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
                  {ticket.status !== "pending" && (
                    <button
                      onClick={() => handleMarkAsDone(ticket.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md w-full hover:bg-blue-600 transition-colors duration-300"
                    >
                      Done
                    </button>
                  )}
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => handleOnChatClick(ticket)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-md w-full hover:bg-orange-600 transition-colors duration-300"
                  >
                    Chat
                  </button>
                </div>
              </div>
            ))}

            {showChatModal && selectedTicket && (
              <div className="fixed inset-0 z-20 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-white dark:bg-gray-600 px-4 rounded-lg shadow-lg sm:w-[600px]">
                  <div className="flex justify-end">
                    <button
                      className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                      onClick={() => setShowChatModal(false)}
                    >
                      X
                    </button>
                  </div>
                  <Chat
                    user1Id={selectedTicket.userId}
                    user2Id={selectedTicket.serviceownedId}
                    user1Name={selectedTicket.user.name}
                    user2Name={selectedTicket.service.name}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Previous Tickets Section with Dropdown Sorting */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-2xl font-semibold text-text">Previous Tickets</h4>

          {/* Sort Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300"
            >
              <span>Sort By</span>
              <svg
                className={`ml-2 w-4 h-4 transition-transform duration-200 ${
                  showSortDropdown ? "transform rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>

            {/* Sort Dropdown Menu */}
            {showSortDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status:
                    </label>
                    <select
                      name="status"
                      value={sortOptions.status}
                      onChange={handleSortChange}
                      className="border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm w-full bg-white dark:bg-gray-700 dark:text-gray-300"
                    >
                      <option value="">All Statuses</option>
                      <option value="cancel">Cancelled</option>
                      <option value="done">Done</option>
                      <option value="pending">Pending</option>
                      <option value="working">Working</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableDateFilter"
                        checked={sortOptions.enableDateFilter}
                        onChange={toggleDateFilter}
                        className="mr-2"
                      />
                      <label
                        htmlFor="enableDateFilter"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Filter by Date
                      </label>
                    </div>
                  </div>

                  {sortOptions.enableDateFilter && (
                    <div className="space-y-3 mb-4 pl-2 border-l-2 border-blue-200 dark:border-blue-500">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          From:
                        </label>
                        <input
                          type="date"
                          name="dateFrom"
                          value={sortOptions.dateFrom}
                          onChange={handleSortChange}
                          className="border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm w-full bg-white dark:bg-gray-700 dark:text-gray-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          To:
                        </label>
                        <input
                          type="date"
                          name="dateTo"
                          value={sortOptions.dateTo}
                          onChange={handleSortChange}
                          className="border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm w-full bg-white dark:bg-gray-700 dark:text-gray-300"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-4">
                    <button
                      onClick={resetFilters}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Reset
                    </button>
                    <button
                      onClick={applySorting}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 dark:hover:bg-blue-400"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Sort Indicators */}
        {(appliedSort.status || appliedSort.enableDateFilter) && (
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            {appliedSort.status && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Status: {appliedSort.status}
              </span>
            )}
            {appliedSort.enableDateFilter && appliedSort.dateFrom && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                From: {appliedSort.dateFrom}
              </span>
            )}
            {appliedSort.enableDateFilter && appliedSort.dateTo && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                To: {appliedSort.dateTo}
              </span>
            )}
          </div>
        )}

        {previousTickets.length === 0 ? (
          <p className="text-gray-500">
            No previous tickets match your filters.
          </p>
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

      {/* Payment Modal - NEW */}
      {showPaymentModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-background border-black dark:border-gray-100 border p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Please enter your payment details to complete the service.
              <span className="text-sm italic block mt-1">(Demo only - no actual payment will be processed)</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentInfo.cardNumber}
                  onChange={handlePaymentInfoChange}
                  className="border border-gray-300 bg-background rounded-md p-2 w-full"
                  maxLength={16}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={paymentInfo.expiryDate}
                    onChange={handlePaymentInfoChange}
                    className="border border-gray-300 bg-background rounded-md p-2 w-full"
                    maxLength={5}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    placeholder="123"
                    value={paymentInfo.cvv}
                    onChange={handlePaymentInfoChange}
                    className="border border-gray-300 bg-background rounded-md p-2 w-full"
                    maxLength={3}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cardholder Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={paymentInfo.name}
                  onChange={handlePaymentInfoChange}
                  className="border border-gray-300 bg-background rounded-md p-2 w-full"
                />
              </div>
            </div>

            {paymentError && (
              <p className="text-red-600 mt-4 mb-2">{paymentError}</p>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-400 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                className={`px-4 py-2 rounded-md text-white ${
                  isPaymentFormComplete()
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-green-300 cursor-not-allowed"
                } transition-colors duration-300`}
                disabled={!isPaymentFormComplete()}
              >
                Pay & Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-background border-black dark:border-gray-100 border p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Cancel Ticket</h2>
            <p className="mb-2">Please provide a reason for canceling:</p>

            <select
              value={cancelReason}
              onChange={(e) => {
                setCancelReason(e.target.value);
                handleInputInteraction();
              }}
              className="border border-gray-300 bg-background rounded-md p-2 w-full mb-4"
            >
              <option value="">Select a reason...</option>
              <option value="Service not needed anymore">
                Service not needed anymore
              </option>
              <option value="Scheduling conflicts">Scheduling conflicts</option>
              <option value="Poor experience">Poor experience</option>
              <option value="Other">Other</option>
            </select>

            {cancelReason === "Other" && (
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

            {cancelError && <p className="text-red-600 mb-4">{cancelError}</p>}

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
      
      {/* Rate Experience Modal */}
      {showDoneModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-background border-black dark:border-gray-100 border p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Rate Your Experience</h2>
            <input
              type="number"
              placeholder="Rating (1-5)"
              value={rating === null ? "" : rating}
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
                className="bg-green-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-green-600 transition-colors duration-300"
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