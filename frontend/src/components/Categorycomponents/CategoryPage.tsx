import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { Footer } from "../Uicomponents/Footer";
import SortDropdown from "../Uicomponents/SortDropdown";

const CategoryPage = ({
  location,
}: {
  location: { latitude: number; longitude: number };
}) => {
  const { title } = useParams<{ title: string }>();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOptions, setSortOptions] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      const { latitude, longitude } = location;

      if (latitude === 0 && longitude === 0) {
        setError("Please select your location.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/v1/service/closest`,
          {
            params: {
              latitude,
              longitude,
              category: title,
              sortBy: sortOptions.join(","),
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
  }, [title, location, sortOptions]);

  // Helper function for dynamic pricing
  const calculateDynamicPrice = (price: number) => {
    const currentHour = new Date().getHours();

    // Example: apply 20% discount between 6 PM and 9 PM
    if (currentHour >= 18 && currentHour <= 21) {
      return price * 0.8; // 20% discount
    }
    return price; // No discount outside of this time range
  };

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

  const getBadges = (service: any) => {
    const badges = [];
    if (service.rating >= 4.5) badges.push("Top Rated");
    if (service.price && service.price < 500) badges.push("Affordable");
    if (service.distance && service.distance < 3) badges.push("Nearby");
    if (service.reviewCount > 50) badges.push("Popular");
    if (
      service.createdAt &&
      new Date(service.createdAt) >
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    ) {
      badges.push("New");
    }
    return badges;
  };

  return (
    <div>
      <div className="container w-full mx-auto py-6 md:py-10 px-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8">
          {title} Services
        </h1>
        <div className="flex justify-end">
          <SortDropdown
            sortOptions={sortOptions}
            setSortOptions={setSortOptions}
          />
        </div>

        {loading && (
          <div className="flex justify-center items-center h-full">
            <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
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
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-10">
            {services.map((service) => {
              const badges = getBadges(service);
              const dynamicPrice = service.price ? calculateDynamicPrice(service.price) : "N/A";

              return (
                <div
                  key={service.id}
                  className="border border-gray-300 p-6 rounded-lg shadow-lg bg-[#ebeef4] dark:bg-[#374151] flex flex-col cursor-pointer hover:shadow-2xl transition"
                  onClick={() => navigate(`/service/${service.id}`)}
                >
                  <h2 className="text-xl md:text-2xl font-semibold mb-2">
                    {service.name}
                  </h2>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {renderStars(service.rating || 0)}
                      <span className="ml-2">
                        ({service.reviewCount || 0} reviews)
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {badges.map((badge, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-semibold px-3 py-1 rounded-full
        bg-blue-100 text-blue-800
        dark:bg-blue-900 dark:text-blue-100"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="mb-4">
                    {service.description || "Service description not available."}
                  </p>

                  <p className="mb-4">
                    Distance: {service.distance ? service.distance.toFixed(2) : "N/A"} km
                  </p>

                  <p className="mb-4">
                    Price: {dynamicPrice !== "N/A" ? `₹${dynamicPrice.toFixed(2)}` : "N/A"}
                  </p>
                  <p className="mb-4">Contact: {service.contactNo || "N/A"}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
