import  { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';


interface Service {
    latitude: number;
    longitude: number;
    name: string;
    description?: string;
  }

const MyMap = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      //@ts-ignore
      setUserLocation([latitude, longitude]);

      const response = await fetch('/services/closest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      const data = await response.json();
      setServices(data);
    });
  }, []);

  return (
    <MapContainer center={userLocation || [0, 0]} zoom={13} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userLocation && (
        <Marker position={userLocation}>
          <Popup>You are here</Popup>
        </Marker>
      )}
      {services.map((service, index) => (
        <Marker key={index} position={[service.latitude, service.longitude]}>
          <Popup>
            <b>{service.name}</b><br />
            {service.description}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MyMap;