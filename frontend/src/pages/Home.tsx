import { useEffect, useState } from "react";
import { Cards } from "../components/Homecomponents/Cards";
import { Footer } from "../components/Uicomponents/Footer";
import Gains from "../components/Homecomponents/Gains";
import Hero from "../components/Homecomponents/Hero";
import { Service } from "../components/Homecomponents/Listing";
import { Navbar } from "../components/Uicomponents/Navbar";
import { Process } from "../components/Homecomponents/process";
import { Add_Data } from "../components/Add_data";
import { BACKEND_URL } from "../config";
import Cookies from "js-cookie";
import axios from "axios";
import { Faq } from "../components/Homecomponents/Faq";

export const Home = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const needsAdditionalData = localStorage.getItem('needsAdditionalData') === 'true';
    if (needsAdditionalData) {
      setShowModal(true);
    }
  }, []);

  const AdditionalData = async (data: any) => {
    try {
      const token = Cookies.get('token');
      const role = Cookies.get('role');
      
      const payload = {
        ...data,
      };
      
      if(role == 'user'){
      await axios.post(`${BACKEND_URL}/api/v1/user/additional-data`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
    }
   
      localStorage.removeItem('needsAdditionalData'); 
      setShowModal(false);
    } catch (error) {
      console.error("Failed to submit additional data:", error);
    }
  };


  return (
    <div >
      <div>
      {showModal && <Add_Data onSubmit={AdditionalData} />}
      </div>
      <Navbar />
      <Hero />
      <Cards />
      <div id="process">
        <Process />
      </div>
      <div id="your-Gains">
        <Gains />
      </div>
      <Service />
      <div id="faq">
        <Faq />
      </div>
      <Footer/>
    </div>
  );
};