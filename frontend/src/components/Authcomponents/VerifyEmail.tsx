import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { BACKEND_URL } from "../../config";
import { useAuth } from "../../Context/Authcontext";


const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading");
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const { setAuthState } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setVerificationStatus("error");
      setVerificationError("Invalid or missing token.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/verify-email`, { token });
        const { jwt, name, role } = response.data;

        Cookies.set("token", jwt, { expires: 7 });
        Cookies.set("authUser", name, { expires: 7 });
        Cookies.set("role", role, { expires: 7 });

        setAuthState({
            authUser: name,
            isLoggedIn: true,
            role: role,
            token: jwt,
          });
    
          localStorage.setItem("needsAdditionalData", "true");
    
        setVerificationStatus("success");
        navigate("/", { replace: true });
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || "An error occurred during verification.";
        setVerificationError(errorMessage);
        setVerificationStatus("error");
      }
    };

    verifyEmail();
  }, [location.search]);

  if (verificationStatus === "loading") {
    return <p>Verifying your email...</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col justify-center items-center h-full"
    >
      {verificationStatus === "success" ? (
        <>
          <p className="text-green-500">Your email has been successfully verified!</p>
          <button onClick={() => navigate("/")} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300">
            Go to Login
          </button>
        </>
      ) : (
        <>
          <p className="text-red-500">{verificationError || "There was an error verifying your email."}</p>
          <button onClick={() => navigate("/signup")} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300">
            Go to Home
          </button>
        </>
      )}
    </motion.div>
  );
};

export default VerifyEmail;
