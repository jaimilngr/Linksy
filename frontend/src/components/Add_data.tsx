import { useEffect, useState } from "react"; 
import Cookies from "js-cookie";
import Lottie from "lottie-react";
import serviceanimation from "../assets/animations/service.json";
import { Link } from "react-router-dom";
import LocationMap from "./Uicomponents/LocationMap";

interface ModalProps {
  onSubmit: (data: { address: string }) => void;
}

export const Add_Data = ({ onSubmit }: ModalProps) => {
  const [step, setStep] = useState(1);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState(""); 
  const [loading, setLoading] = useState(false); // Loading state
  const role = Cookies.get("role"); 

  useEffect(() => {
    const storedLatitude = localStorage.getItem("latitude");
    const storedLongitude = localStorage.getItem("longitude");

    if (storedLatitude && storedLongitude) {
      setPosition({
        lat: parseFloat(storedLatitude),
        lng: parseFloat(storedLongitude),
      });
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handlePositionChange = (newPosition: { lat: number; lng: number }) => {
    setPosition(newPosition);
  };

  const handleNext = () => {
    if (position) {
      localStorage.setItem("latitude", position.lat.toString());
      localStorage.setItem("longitude", position.lng.toString());
      setStep(2); 
    }
  };

  const handleAddressConfirm = async () => {
    if (address.trim() === "") {
      setAddressError("Address cannot be empty.");
    } else {
      setAddressError(""); 
      setLoading(true); // Set loading to true
      await onSubmit({ address }); // Assuming onSubmit returns a promise
      setStep(role === "service" ? 3 : 0); 
      setLoading(false); // Reset loading state after submission
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full m-10 md:m-0 md:w-1/3 dark:bg-[#374151]">
        {step === 1 ? (
          <>
            <h2 className="text-lg md:text-2xl font-bold mb-4">Confirm Your Location</h2>
            <div className="w-full h-64 mb-4">
              {position ? (
                <LocationMap position={position} onPositionChange={handlePositionChange} />
              ) : (
                <p>Loading map...</p>
              )}
            </div>
            <button
              onClick={handleNext}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
              disabled={!position}
            >
              Next
            </button>
          </>
        ) : step === 2 ? (
          <>
            <h2 className="text-lg md:text-2xl font-bold mb-4">Provide Address Details</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              {addressError && (
                <p className="text-red-500 mb-2">{addressError}</p> 
              )}
              <input
                type="text"
                name="address"
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="p-2 mb-4 w-full border text-black border-gray-300 rounded"
              />
              <button
                type="button"
                onClick={handleAddressConfirm} 
                className="bg-green-500 text-white px-4 py-2 rounded w-full"
              >
                Confirm
              </button>
            </form>
          </>
        ) : step === 3 ? (
          <>
            <h2 className="text-lg md:text-2xl font-bold mb-4">Add Your Service Now</h2>
            <Lottie animationData={serviceanimation} />
            <Link to="/dashboard">
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded w-full mt-4"
              >
                Go to Dashboard
              </button>
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
};
