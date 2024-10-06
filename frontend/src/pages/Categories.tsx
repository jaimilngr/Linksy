import { useState } from "react";
import { Navbar } from "../components/Uicomponents/Navbar";
import CategoryPage from "../components/Categorycomponents/CategoryPage";

const Categories = () => {
  const [location, setLocation] = useState({
    latitude: parseFloat(localStorage.getItem("latitude") || "0"),
    longitude: parseFloat(localStorage.getItem("longitude") || "0"),
  });

  const handleUpdateLocation = (lat: number, lng: number) => {
    setLocation({ latitude: lat, longitude: lng });
    localStorage.setItem("latitude", lat.toString());
    localStorage.setItem("longitude", lng.toString());
  };

  return (
    <div>
      <Navbar onUpdateLocation={handleUpdateLocation} />
      <CategoryPage location={location} />
    </div>
  );
};

export default Categories;
