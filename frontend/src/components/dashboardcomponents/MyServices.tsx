import { useState, useEffect } from "react";
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import Cookies from 'js-cookie';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

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
    serviceType: '',
    name: '',
    description: '',
    price: '',
    timing: '',
    category: '',
    contactNo: '',
    lat: null as number | null,
    lng: null as number | null,
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);

  const categories = [
    'Tech',
    'Cleaning',
    'AC Service',
    'Painting Contractor',
    'Courier Service',
    'Catering',
    'Event Organizer',
    'Home Decoration',
    'Laptop Repair',
    'Consultant',
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        error => {
          console.error('Error fetching location:', error);
          setUserLocation({ lat: 51.505, lng: -0.09 });
        }
      );
    } else {
      setUserLocation({ lat: 51.505, lng: -0.09 });
    }

    const fetchServices = async () => {
      try {
        const token = Cookies.get('token');
        const { data } = await axios.get(`${BACKEND_URL}/api/v1/service/myservices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setServices(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchServices();
  }, []);

  const handleCreateService = async () => {
    try {
      const token = Cookies.get('token');
      const formData = new FormData();
      Object.keys(newService).forEach(key => {
        //@ts-ignore
        formData.append(key, newService[key]);
      });

      await axios.post(`${BACKEND_URL}/api/v1/service/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessMessage('Service created successfully');

      setNewService({
        id: null,
        serviceType: '',
        name: '',
        description: '',
        price: '',
        timing: '',
        category: '',
        contactNo: '',
        lat: null,
        lng: null,
      });
      setShowCreateForm(false);

      const { data } = await axios.get(`${BACKEND_URL}/api/v1/service/myservices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setServices(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create service');
      setSuccessMessage(null);
    }
  };

  const handleUpdateService = async () => {
    try {
      const token = Cookies.get('token');
      const formData = new FormData();
      Object.keys(newService).forEach(key => {
        //@ts-ignore
        formData.append(key, newService[key]);
      });

      await axios.put(`${BACKEND_URL}/api/v1/service/update/${newService.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessMessage('Service updated successfully');

      setNewService({
        id: null,
        serviceType: '',
        name: '',
        description: '',
        price: '',
        timing: '',
        category: '',
        contactNo: '',
        lat: null,
        lng: null,
      });
      setShowEditForm(false);

      const { data } = await axios.get(`${BACKEND_URL}/api/v1/service/myservices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setServices(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update service');
      setSuccessMessage(null);
    }
  };

  const handleDeleteService = async (id: number) => {
    try {
      const token = Cookies.get('token');
      await axios.delete(`${BACKEND_URL}/api/v1/service/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage('Service deleted successfully');

      const { data } = await axios.get(`${BACKEND_URL}/api/v1/service/myservices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setServices(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete service');
      setSuccessMessage(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewService({ ...newService, [name]: value });
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    setNewService({
      ...newService,
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    });
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
    setShowEditForm(true);
  };

  const LocationMap = () => {
    const map = useMap();

    useEffect(() => {
      if (userLocation) {
        map.setView([userLocation.lat, userLocation.lng], 13);
      }
    }, [userLocation, map]);

    useMapEvents({
      click(e) {
        handleMapClick(e);
      },
    });

    return (
      <>
        {newService.lat && newService.lng && (
          <Marker position={[newService.lat, newService.lng]} />
        )}
        {!newService.lat && !newService.lng && userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} />
        )}
      </>
    );
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-6">My Services</h3>

      {successMessage && (
        <p className="text-green-600 mb-4">{successMessage}</p>
      )}
      {error && (
        <p className="text-red-600 mb-4">{error}</p>
      )}

      {services.length === 0 && !error && (
        <p className="text-gray-600 mb-4">You do not have any services. Create a new service below.</p>
      )}

      {services.length > 0 && (
        <div className="mt-6">
          <h4 className="text-xl font-semibold mb-4">Your Services</h4>
          <ul className="space-y-4">
            {services.map(service => (
              <li key={service.id} className="p-4 border border-gray-300 rounded bg-white dark:bg-[#374151]">
                <h5 className="text-lg font-semibold">{service.name}</h5>
                <p>{service.description}</p>
                <p><strong>Price:</strong> ₹{service.price}</p>
                <p><strong>Timing:</strong> {service.timing}</p>
                <p><strong>Category:</strong> {service.category}</p>
                <p><strong>Contact:</strong> {service.contactNo}</p>
                <div className="mt-4">
                  <button
                    className="px-4 py-2 bg-blue-500  rounded hover:bg-blue-600"
                    onClick={() => handleEditService(service)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500  rounded hover:bg-red-600 ml-2"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(showCreateForm || showEditForm) && (
        <div className="mt-6 p-4 border border-gray-300 rounded bg-white dark:bg-[#374151]">
          <h4 className="text-xl font-semibold mb-4">{showCreateForm ? 'Create New Service' : 'Edit Service'}</h4>
          <form onSubmit={e => {
            e.preventDefault();
            showCreateForm ? handleCreateService() : handleUpdateService();
          }}>
            <div className="mb-4">
              <label htmlFor="serviceType" className="block text-gray-700 dark:text-gray-300">Service Type</label>
              <input
                type="text"
                id="serviceType"
                name="serviceType"
                value={newService.serviceType}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded dark:bg-[#374151]"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newService.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:bg-[#374151]"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                id="description"
                name="description"
                value={newService.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:bg-[#374151]"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="price" className="block text-gray-700 dark:text-gray-300">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={newService.price}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:bg-[#374151]"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="timing" className="block text-gray-700 dark:text-gray-300">Timing</label>
              <input
                type="text"
                id="timing"
                name="timing"
                value={newService.timing}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:bg-[#374151]"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="category" className="block text-gray-700 dark:text-gray-300">Category</label>
              <select
                id="category"
                name="category"
                value={newService.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:bg-[#374151]"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="contactNo" className="block text-gray-700 dark:text-gray-300">Contact No</label>
              <input
                type="text"
                id="contactNo"
                name="contactNo"
                value={newService.contactNo}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:bg-[#374151]"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="location" className="block text-gray-700 dark:text-gray-300">Location</label>
              <MapContainer center={[userLocation?.lat || 51.505, userLocation?.lng || -0.09]} zoom={13} style={{ height: '200px', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap contributors"
                />
                <LocationMap />
              </MapContainer>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500  rounded hover:bg-blue-600"
            >
              {showCreateForm ? 'Create Service' : 'Update Service'}
            </button>
            <button
              type="button"
              onClick={() => { 
                setShowCreateForm(false); 
                setShowEditForm(false); 
                setNewService({
                  id: null,
                  serviceType: '',
                  name: '',
                  description: '',
                  price: '',
                  timing: '',
                  category: '',
                  contactNo: '',
                  lat: null,
                  lng: null,
                });
              }}
              className="px-4 py-2 bg-gray-500  rounded hover:bg-gray-600 ml-2"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
      {!showCreateForm && !showEditForm && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="mt-6 px-4 py-2 bg-green-500  rounded hover:bg-green-600"
        >
          Create New Service
        </button>
      )}
    </div>
  );
};
