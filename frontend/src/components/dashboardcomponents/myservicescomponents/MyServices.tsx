import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../../config";
import Cookies from "js-cookie";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { categories } from "../../../data/categories";

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

export const MyServices = () => {
  const [services, setServices] = useState<any[]>([]);
  const [newService, setNewService] = useState({
    id: null as number | null,
    serviceType: "",
    name: "",
    description: "",
    price: 0,
    timing: "",
    category: "",
    contactNo: "",
    lat: null as number | null,
    lng: null as number | null,
  });
  const [editServiceId, setEditServiceId] = useState<number | null | boolean>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userCoords);
          setNewService((prevState) => ({
            ...prevState,
            lat: userCoords.lat,
            lng: userCoords.lng,
          }));
        },
        (error) => {
          console.error("Error fetching location:", error);
          const defaultCoords = { lat: 23.0225, lng: 72.5714 };
          setUserLocation(defaultCoords);
          setNewService((prevState) => ({
            ...prevState,
            lat: defaultCoords.lat,
            lng: defaultCoords.lng,
          }));
        }
      );
    } else {
      const defaultCoords = { lat: 23.0225, lng: 72.5714 };
      setUserLocation(defaultCoords);
      setNewService((prevState) => ({
        ...prevState,
        lat: defaultCoords.lat,
        lng: defaultCoords.lng,
      }));
    }

    const fetchServices = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(
          `${BACKEND_URL}/api/v1/service/myservices`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setServices(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchServices();
  }, []);

  const handleCreateService = async () => {
    try {
      if (newService.lat === null || newService.lng === null) {
        console.log("Location is null, trying to fetch again...");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userCoords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setNewService((prevState) => ({
              ...prevState,
              lat: userCoords.lat,
              lng: userCoords.lng,
            }));
          },
          (error) => {
            console.error("Error fetching location:", error);
            const defaultCoords = { lat: 23.0225, lng: 72.5714 };
            setNewService((prevState) => ({
              ...prevState,
              lat: defaultCoords.lat,
              lng: defaultCoords.lng,
            }));
          }
        );
        return;
      }
    } catch (err) {
      alert("location not set please select on map");
    }
    try {
      const token = Cookies.get("token");

      await axios.post(`${BACKEND_URL}/api/v1/service/create`, newService, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setSuccessMessage("Service created successfully");

      setNewService({
        id: null,
        serviceType: "",
        name: "",
        description: "",
        price:0,
        timing: "",
        category: "",
        contactNo: "",
        lat: null,
        lng: null,
      });
      setShowCreateForm(false);

      const { data } = await axios.get(
        `${BACKEND_URL}/api/v1/service/myservices`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setServices(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create service");
      setSuccessMessage(null);
    }
  };

  const handleUpdateService = async (service: any) => {
    try {
      const token = Cookies.get("token");

      await axios.put(
        `${BACKEND_URL}/api/v1/service/update/${newService.id}`,
        newService,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSuccessMessage("Service updated successfully");

      setNewService({
        id: null,
        serviceType: "",
        name: "",
        description: "",
        price: 0,
        timing: "",
        category: "",
        contactNo: "",
        lat: null,
        lng: null,
      });
      setEditServiceId(service.id);

      const { data } = await axios.get(
        `${BACKEND_URL}/api/v1/service/myservices`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setServices(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update service");
      setSuccessMessage(null);
    }
  };

  const handleDeleteService = async (id: number) => {
    try {
      const token = Cookies.get("token");
      await axios.delete(`${BACKEND_URL}/api/v1/service/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage("Service deleted successfully");

      const { data } = await axios.get(
        `${BACKEND_URL}/api/v1/service/myservices`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setServices(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete service");
      setSuccessMessage(null);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNewService((prevState) => ({
      ...prevState,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleEditService = (service: any) => {
    setNewService({
      id: service.id,
      serviceType: service.serviceType,
      name: service.name,
      description: service.description,
      price: service.price,
      timing: service.timing,
      category: service.category,
      contactNo: service.contactNo,
      lat: service.lat,
      lng: service.lng,
    });
    setEditServiceId(service.id);
    setShowCreateForm(false);
  };

  const handleCreateForm = () => {
    setNewService({
      id: null,
      serviceType: "",
      name: "",
      description: "",
      price: 0,
      timing: "",
      category: "",
      contactNo: "",
      lat: null,
      lng: null,
    });
    setShowCreateForm(true);
    setEditServiceId(false);
  };
  const LocationMap = () => {
    const map = useMap();
    const [markerPosition, setMarkerPosition] = useState<
      [number, number] | null
    >(null);

    useEffect(() => {
      if (userLocation) {
        setMarkerPosition([userLocation.lat, userLocation.lng]);
        map.setView([userLocation.lat, userLocation.lng], 13);
      }
    }, [userLocation, map]);

    useEffect(() => {
      if (newService.lat && newService.lng) {
        setMarkerPosition([newService.lat, newService.lng]);
        map.setView([newService.lat, newService.lng], 13);
      }
    }, [newService, map]);

    useMapEvents({
      click(e) {
        setNewService({
          ...newService,
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      },
    });

    return markerPosition ? <Marker position={markerPosition} /> : null;
  };

  const servicesArray = Array.isArray(services) ? services : [];
  return (
    <div>
      <h3 className="text-2xl font-semibold mb-6">My Services</h3>

      {successMessage && (
        <p className="text-green-600 mb-4">{successMessage}</p>
      )}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <div className="sliding-bars absolute inset-0">
          <div></div>
          <div></div>
          <div></div>
        </div>
      ) : servicesArray.length === 0 ? (
        <p className="text-gray-600 mb-4">
          You do not have any services. Create a new service below.
        </p>
      ) : (
        <div className="mt-6">
          <h4 className="text-xl font-semibold mb-4">Your Services</h4>
          <ul className="space-y-4">
            {servicesArray.map((service) => (
              <li
                key={service.id}
                className="p-4 border border-gray-300 rounded bg-[#bfcae8] dark:bg-[#374151] relative"
              >
                <h5 className="text-lg font-semibold">{service.name}</h5>
                <p>{service.description}</p>
                <p>
                  <strong>Price:</strong> ₹{service.price}
                </p>
                <p>
                  <strong>Timing:</strong> {service.timing}
                </p>
                <p>
                  <strong>Category:</strong> {service.category}
                </p>
                <p>
                  <strong>Contact:</strong> {service.contactNo}
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => handleEditService(service)}
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>

                {editServiceId === service.id && (
                  <div className="mt-4 border-gray-500 p-4 rounded">
                    <h4 className="text-xl font-semibold mb-4">Edit Service</h4>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdateService(service.id);
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label
                          htmlFor="serviceType"
                          className="block text-sm font-medium  dark:text-gray-300"
                        >
                          Service Type
                        </label>
                        <select
                          name="serviceType"
                          value={newService.serviceType}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded p-2 w-full dark:bg-[#374151]"
                          required
                        >
                          <option value="" disabled>
                            Select a service type
                          </option>
                          <option value="Offline">Offline</option>
                          <option value="Online">Online</option>
                        </select>
                      </div>

                      <div>
                        <label className="block ">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={newService.name}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded p-2 w-full dark:bg-[#374151]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block ">Description</label>
                        <textarea
                          name="description"
                          value={newService.description}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded p-2 w-full dark:bg-[#374151]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block ">Price</label>
                        <input
                          type="number"
                          name="price"
                          value={newService.price}
                          onChange={handleInputChange}
                          className="border no-spinner border-gray-300 rounded p-2 w-full dark:bg-[#374151]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block ">Timing</label>
                        <input
                          type="text"
                          name="timing"
                          value={newService.timing}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded p-2 w-full dark:bg-[#374151]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block ">Category</label>
                        <select
                          name="category"
                          value={newService.category}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded p-2 w-full dark:bg-[#374151]"
                          required
                        >
                          <option value="" disabled>
                            Select a category
                          </option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block ">Contact No</label>
                        <input
                          type="text"
                          name="contactNo"
                          value={newService.contactNo}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded p-2 w-full dark:bg-[#374151]"
                          required
                        />
                      </div>
                      <div className="mt-4">
                        <MapContainer
                          center={[
                            newService.lat || 23.0225,
                            newService.lng || 72.5714,
                          ]}
                          zoom={13}
                          style={{ height: "300px", width: "100%" }}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <LocationMap />
                        </MapContainer>
                      </div>
                      <div className="mt-4">
                        <button
                          type="submit"
                          className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                          Update Service
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditServiceId(null)}
                          className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleCreateForm}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-6"
      >
        Add New Service
      </button>
      {showCreateForm && (
        <div className="mt-6 bg-[#bfcae8] dark:bg-[#374151] p-5">
          <h4 className="text-xl font-semibold mb-4">Create New Service</h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateService();
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="serviceType"
                className="block text-sm font-medium  dark:text-gray-300"
              >
                Service Type
              </label>
              <select
                name="serviceType"
                value={newService.serviceType}
                onChange={handleInputChange}
                className="border border-gray-300 rounded p-2 w-full dark:bg-[#374151]"
                required
              >
                <option value="" disabled>
                  Select a service type
                </option>
                <option value="Offline">Offline</option>
                <option value="Online">Online</option>
              </select>
            </div>
            <div>
              <label className="block ">Name</label>
              <input
                type="text"
                name="name"
                value={newService.name}
                onChange={handleInputChange}
                placeholder="eg. Jaipie Services"
                className="border border-gray-300 rounded p-2 w-full dark:bg-[#374151] "
                required
              />
            </div>
            <div>
              <label className="block ">Description</label>
              <textarea
                name="description"
                value={newService.description}
                onChange={handleInputChange}
                placeholder="Write something about your services"
                className="border border-gray-300 rounded p-2 w-full dark:bg-[#374151]"
                required
              />
            </div>
            <div>
              <label className="block ">Price</label>
              <input
                type="number"
                name="price"
                value={newService.price || ""}
                placeholder="Rupees"
                onChange={handleInputChange}
                className="border no-spinner border-gray-300 rounded p-2 w-full dark:bg-[#374151]"
                required
              />
            </div>
            <div>
              <label className="block ">Timing</label>
              <input
                type="text"
                name="timing"
                value={newService.timing}
                onChange={handleInputChange}
                placeholder="eg. 9 am - 9 pm"
                className="border border-gray-300 rounded p-2 w-full dark:bg-[#374151]"
                required
              />
            </div>
            <div>
              <label className="block ">Category</label>
              <select
                name="category"
                value={newService.category}
                onChange={handleInputChange}
                className="border border-gray-300 rounded p-2 w-full dark:bg-[#374151]"
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block ">Contact No</label>
              <input
                type="text"
                name="contactNo"
                value={newService.contactNo}
                onChange={handleInputChange}
                placeholder="eg. 1234567890"
                className="border border-gray-300 rounded p-2 w-full dark:bg-[#374151]"
                required
              />
            </div>
            <div className="mt-4 z-[-1]">
              <MapContainer
                center={[
                  userLocation?.lat || 23.0225,
                  userLocation?.lng || 72.5714,
                ]}
                zoom={13}
                style={{ height: "300px", width: "100%" }}
                className="z-0"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMap />
              </MapContainer>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Create Service
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
