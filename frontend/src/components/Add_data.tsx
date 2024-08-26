import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Cookies from "js-cookie";
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import Lottie from "lottie-react";
import serviceanimation from "../assets/animations/service.json";
import { Link } from "react-router-dom";


L.Marker.prototype.options.icon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

interface ModalProps {
  onSubmit: (data: { address: string }) => void;
}

export const Add_Data = ({ onSubmit }: ModalProps) => {
  const [step, setStep] = useState(1);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const role = Cookies.get('role');

  useEffect(() => {
    const storedLatitude = localStorage.getItem('latitude');
    const storedLongitude = localStorage.getItem('longitude');
    
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (position) {
      localStorage.setItem('latitude', position.lat.toString());
      localStorage.setItem('longitude', position.lng.toString());

      onSubmit({ address });
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });

    return position ? <Marker position={position}></Marker> : null;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full md:w-1/3">
        {step === 1 ? (
          <>
            <h2 className="text-lg text-black md:text-2xl font-bold mb-4">Confirm Your Location</h2>
            <div className="w-full h-64 mb-4">
              {position ? (
                <MapContainer
                  center={position}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker />
                </MapContainer>
              ) : (
                <p>Loading map...</p>
              )}
            </div>
            <button
              onClick={() => setStep(2)}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
              disabled={!position}
            >
              Next
            </button>
          </>
        ) : (
          <>
          
          {role === 'service' ? (
  <>
    <h2 className="text-lg text-black md:text-2xl font-bold mb-4">Add Your Service Now</h2>
    <Lottie animationData={serviceanimation}/>
    <div className="flex justify-around mt-3">
      <button
        type="button"
        onClick={() => setStep(1)}
        className="bg-gray-500 text-white px-4 py-2 rounded w-32"
      >
        Back
      </button>
      <Link to={"/dashboard"}>
      <button
        type="submit" 
        onClick={()=>{
          localStorage.removeItem('needsAdditionalData'); 
        }}
        className="bg-green-500 text-white px-4 py-2 rounded"
        >
        Create Service
      </button>
        </Link>
    </div>
  </>
) : (
  <>
    <h2 className="text-lg md:text-2xl text-black font-bold mb-4">Provide Address Details</h2>
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="address"
        placeholder="Enter your address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="p-2 mb-4 w-full border border-gray-300 rounded"
        required
      />
      <div className="flex justify-around">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="bg-gray-500 text-white px-4 py-2 rounded w-32"
        >
          Back
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-32"
        >
          Submit
        </button>
      </div>
    </form>
  </>
)}
          </>
        )}
      </div>
    </div>
  );
};
