import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../Uicomponents/Navbar";
import { Footer } from "../Uicomponents/Footer";
import { BACKEND_URL } from "../../config";
import { useAuth } from "../../Context/Authcontext";
import { CommentsSection } from "./CommentSection";
import Cookies from "js-cookie";

const ServiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selecteddate, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [requestStatus, setRequestStatus] = useState<{
    error: string | null;
}>({
    error: null,
});

  const navigate = useNavigate();
  const authContext = useAuth();
  const { isLoggedIn } = authContext;

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/service/${id}`);
        setService(response.data);
      } catch (error: any) {
        console.error("Error fetching service details:", error);
        setError(error.message || "Failed to fetch service details");
      } finally {
        setLoading(false);

      }
    };

    fetchServiceDetails();
  }, [id]);

  const CreateServiceRequest = async () => {
    if (!isLoggedIn) {
      setRequestStatus({
        ...requestStatus,
        error: "You must be logged in to send a request.",
      });
      return;
    }
    if (!selecteddate && !time) {
      setRequestStatus({
        ...requestStatus,
        error: "Please provide either a date or time.",
      });
      return;
    }
    const date  = selecteddate ? new Date(selecteddate).toISOString() : null;
    const role = Cookies.get("role")
    try {
      setLoading(true);
      await axios.post(
        `${BACKEND_URL}/api/v1/service/createreq/${id}`,
        { date, time,role },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token") || ""}`,
          },
        }
      );
    
      setDate("");
      setTime("");
      setSuccessMessage("Service request sent successfully!");
      setTimeout(() => {
        setSuccessMessage(null); 
    }, 10000);
    } catch (error: any) {
      console.error("Error fetching service details:", error);
      setRequestStatus({
        error: error.message || "Failed to send service request",
      });
    } finally {
      setLoading(false);
      setRequestStatus({error:null});
    }
  };

 


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }
  

  if (error) {
    return <div>Error: {error}</div>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="rounded-lg">
            <p className="text-lg mb-4">{service.description}</p>
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Contact Info</h3>
              <p className="text-lg mb-1">
                <strong>Timing:</strong> {service.timing}
              </p>
              <p className="text-lg mb-1">
                <strong>Contact:</strong> {service.contactNo}
              </p>
            </div>
          </div>
        );
      case "policies":
        return (
          <div className="rounded-lg">
            <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-600 pb-2">
              Policies
            </h2>
            <p className="text-lg mb-4">{service.policies}</p>
          </div>
        );
      case "reviews":
        return (
          <div className="rounded-lg">
            <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-600 pb-2">
              Reviews
            </h2>

            <p className="text-lg mb-4">
              {" "}
              <CommentsSection serviceId={id} />
            </p>
          </div>
        );
      case "map":
        return (
          <div className="rounded-lg">
            <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-600 pb-2">
              Map
            </h2>
            <p className="text-lg mb-4">{service.mapLocation}</p>
          </div>
        );
      case "availability":
        return (
          <div className="rounded-lg">
            <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-600 pb-2">
              Availability
            </h2>
            <p className="text-lg mb-4">{service.availability}</p>
          </div>
        );
      default:
        return <div className="rounded-lg">Select a tab to view content.</div>;
    }
  };

  const handleShare = () => {
    const shareData = {
      title: service.name,
      text: service.description,
      url: `${window.location.origin}/service/${id}`,
    };

    navigator
      .share(shareData)
      .catch((error) => console.error("Error sharing:", error));
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-6 md:py-10 px-4">
        <button
          className="mb-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
          onClick={() => navigate(-1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </button>
        {service ? (
          <div className="service-details  p-2  grid grid-cols-1 md:grid-cols-[4fr_1fr] gap-4">
            <div className="flex flex-col h-auto border-gray-200 dark:bg-gray-700  dark:border-gray-700 p-5 border-2  rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">{service.name}</h1>
                <button
                  onClick={handleShare}
                  className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                    />
                  </svg>
                  Share
                </button>
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                  ⭐{service.rating.toFixed(1)}
                </p>
                <p className="text-xl font-semibold text-gray-600 dark:text-gray-300 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-5 justify-center self-center items-center"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6h.008v.008H6V6Z"
                    />
                  </svg>
                  {service.category}
                </p>
              </div>

              {/* Responsive Tab Selector */}
              <div>
                <div className="sm:hidden mb-4">
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  >
                    <option value="overview">Overview</option>
                    <option value="policies">Policies</option>
                    <option value="reviews">Reviews</option>
                    <option value="map">Map</option>
                    <option value="availability">Availability</option>
                  </select>
                </div>

                {/* Tab buttons for larger screens */}
                <div className="hidden sm:flex space-x-4 mb-4">
                  <button
                    className={`relative py-2 px-4 ${
                      activeTab === "overview"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("overview")}
                  >
                    Overview
                    {activeTab === "overview" && (
                      <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </button>
                  <button
                    className={`relative py-2 px-4 ${
                      activeTab === "policies"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("policies")}
                  >
                    Policies
                    {activeTab === "policies" && (
                      <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </button>
                  <button
                    className={`relative py-2 px-4 ${
                      activeTab === "reviews"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("reviews")}
                  >
                    Reviews
                    {activeTab === "reviews" && (
                      <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </button>
                  <button
                    className={`relative py-2 px-4 ${
                      activeTab === "map"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("map")}
                  >
                    Map
                    {activeTab === "map" && (
                      <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </button>
                  <button
                    className={`relative py-2 px-4 ${
                      activeTab === "availability"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("availability")}
                  >
                    Availability
                    {activeTab === "availability" && (
                      <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </button>
                </div>
              </div>
              {renderTabContent()}
            </div>

            {/* Pricing Section */}
            <div className="bg-background dark:bg-gray-700 justify-center items-center p-4 rounded-lg border-secondary border-[3px] h-fit">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                Pricing
              </h2>
              <p className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                ₹ {service.price}
              </p>
              <hr />

              <div className="mb-4 mt-3">
                <p className="text-md mb-3 text-gray-800 ">
                  <strong className="text-text">Date:</strong>{" "}
                  <input
                    type="date"
                    value={selecteddate}
                    onChange={(e) => setDate(e.target.value)}
                    className="border p-2 rounded-lg w-full mb-4"
                  />
                </p>
                <p className="text-md mb-3 text-gray-800 ">
                  <strong className="text-text">Time:</strong>{" "}
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="border p-2 rounded-lg w-full mb-4"
                  />{" "}
                </p>
              </div>
              <button
                className={`p-2 text-white py-2 rounded justify-center items-center flex transition duration-200 ${
                  isLoggedIn
                    ? "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600"
                    : "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600"
                }`}
                onClick={() => {
                  if (isLoggedIn) {
                    CreateServiceRequest();
                  } else {
                    navigate("/signup");
                  }
                }}
              >
                {isLoggedIn ? "Request Now" : "Sign In Now"}
              </button>
              {requestStatus.error && (
                <p className="text-red-500 mt-2">{requestStatus.error}</p>
              )}
             {successMessage && (
    <div className="fixed top-24 right-0 mb-4 ml-4 bg-green-100 text-green-700 border border-green-400 p-3 rounded shadow-lg">
        {successMessage}
    </div>
)}
            </div>
          </div>
        ) : (
          <div>No service found</div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ServiceDetails;
