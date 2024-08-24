import { motion } from "framer-motion";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import Cookies from "js-cookie";
import { useAuth } from "../Context/Authcontext";

interface SignInProps {
  handleGoBack: () => void;
}

const SignIn: React.FC<SignInProps> = ({ handleGoBack }) => {
  const navigate = useNavigate();
  const { setAuthState } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // Show loading spinner
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
        email,
        password,
      });

      const { jwt, name, role } = response.data;

      Cookies.set("token", jwt, { expires: 10 });
      Cookies.set("authUser", name, { expires: 10 });
      Cookies.set("role", role, { expires: 10 });

      setAuthState({
        authUser: name,
        isLoggedIn: true,
        role,
        token: jwt,
      });

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Sign-in error:", error);
      alert("Error while signing in");
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  return (
    <motion.div
      key="signin"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.4 }}
      className="relative flex flex-col justify-center items-center h-full z-10"
    >
      <button
        onClick={handleGoBack}
        className="text-white text-4xl border-2 border-red-500 rounded-full w-12 h-12 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition-colors duration-300"
      >
        &times;
      </button>
      <p className="font-sans text-5xl text-white font-bold mb-8 mt-5">
        Welcome Back
      </p>
      <form
        className="flex flex-col gap-4 w-full max-w-md px-10"
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          placeholder="Email"
          className="p-2 rounded bg-white text-gray-900"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 rounded bg-white text-gray-900"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="relative inline-flex items-center justify-center p-2 text-white bg-blue-600 border border-blue-700 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 font-medium rounded-full text-sm px-5 py-2.5"
        >
          {loading ? (
            <div className="sliding-bars absolute inset-0">
              <div></div>
              <div></div>
              <div></div>
            </div>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default SignIn;
