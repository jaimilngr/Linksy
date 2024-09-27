import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate added here
import axios from "axios";
import { Navbar } from "../Uicomponents/Navbar";
import { BACKEND_URL } from "../../config";
import { Footer } from "../Uicomponents/Footer";

const CategoryPage = () => {
  const { title } = useParams<{ title: string }>();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Added navigate hook

  useEffect(() => {
    const fetchServices = async () => {
      const latitude = localStorage.getItem("latitude");
      const longitude = localStorage.getItem("longitude");

      if (!latitude || !longitude) {
        setError("Please select your location.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/v1/service/closest`,
          {
            params: {
              latitude,
              longitude,
              category: title,
            },
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (Array.isArray(response.data)) {
          setServices(response.data);
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (error: any) {
        console.error("Error fetching services:", error);
        setError(
          error.response?.data?.error ||
            error.message ||
            "Failed to fetch services"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [title]);

  const renderStars = (rating: number) => {
    const maxStars = 5;
    const stars = Array(maxStars)
      .fill(false)
      .map((_, index) => index < rating);

    return (
      <div className="flex items-center space-x-1">
        {stars.map((filled, index) => (
          <svg
            key={index}
            className={`w-5 h-5 ${filled ? "text-yellow-500" : "text-black dark:text-white"}`}
            fill={filled ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2.4l2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.7-5.2 2.7 1-5.9-4.3-4.2 5.9-.9L12 2.4z"
              fill={filled ? "currentColor" : "none"}
              stroke={filled ? "none" : "currentColor"}
            />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="container  w-fit  mx-auto py-6 md:py-10 px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8">
          {title} Services
        </h1>

        {loading && (
          <div className="mt-10 text-center">
            <p className="text-lg text-gray-600">Loading services...</p>
          </div>
        )}

        {error && (
          <div className="mt-10 text-center text-red-500">
            <p className="text-lg">{error}</p>
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <div className="mt-10 text-center">
            <p className="text-lg">No services found for {title}.</p>
          </div>
        )}

        {!loading && !error && services.length > 0 && (
          <div className="mt-10 grid gap-6 px-10 lg:grid-cols-1">
            {services.map((service) => (
              <div
                key={service.id}
                className="border border-gray-300 p-6 rounded-lg shadow-lg bg-[#ebeef4] dark:bg-[#374151] flex flex-col md:flex-row md:space-x-4 items-start md:items-center"
                onClick={() => navigate(`/service/${service.id}`)} // Navigate to service details on click
              >
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-semibold mb-2">
                    {service.name}
                  </h2>
                  <div className="flex items-center mb-2">
                    {renderStars(service.rating || 0)}
                    <span className="ml-2">
                      ({service.totalRatings || 0} ratings)
                    </span>
                  </div>
                  <p className="mb-4">
                    {service.description || "Service description not available."}
                  </p>
                  <p className="mb-4">
                    Distance: {service.distance ? service.distance.toFixed(2) : "N/A"} km
                  </p>
                </div>
                <div className="flex flex-col md:items-end">
                  <p className="mb-4">
                    Contact: {service.contactNo || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
