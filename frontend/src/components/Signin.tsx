import { motion } from "framer-motion";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useAuth } from "../Context/Authcontext";
import Cookies from "js-cookie";

interface SignInProps {
  handleGoBack: () => void;
}

const SignIn = ({ handleGoBack }: SignInProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const authContext = useAuth();

  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
        email,
        password,
      });
      const { jwt , name } = response.data;

      Cookies.set('token', jwt, { expires: 10 });
      Cookies.set('authUser', name, { expires: 10 });
    

      navigate("/", { replace: true });
    } catch (e) {
      alert("Error while signing in");
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
        className="text-white text-4xl border-2 border-red-500 rounded-full w-12 h-12 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition-colors duration-300 "
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
          className="text-white bg-blue-600 border border-blue-700 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 font-medium rounded-full text-sm px-5 py-2.5"
        >
          Sign In
        </button>
      </form>
    </motion.div>
  );
};

export default SignIn;
