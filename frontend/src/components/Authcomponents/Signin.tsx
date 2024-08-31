import { motion } from "framer-motion";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import Cookies from "js-cookie";
import { useAuth } from "../../Context/Authcontext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface SignInProps {
  handleGoBack: () => void;
}

const SignIn: React.FC<SignInProps> = ({ handleGoBack }) => {
  const navigate = useNavigate();
  const { setAuthState } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    if (!email) {
      return "Email is required";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Password is required";
    } else if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setEmailError(emailError);
    setPasswordError(passwordError);

    if (emailError || passwordError) return;

    setLoading(true);
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
    } catch (error: any) {
      if (error.response) {
        const { errors, error: serverError } = error.response.data;

        if (errors) {
          setErrors(errors);
        } else if (serverError) {
          setGeneralError(serverError);
        }
      } else {
        setGeneralError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
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
        <div>
          <input
            type="email"
            placeholder="Email"
            className="p-2 rounded bg-white text-gray-900 w-full"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(validateEmail(e.target.value));
            }}
          />
          {emailError && <p className="text-red-500 text-sm mt-2">{emailError}</p>}
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="p-2 rounded bg-white text-gray-900 w-full pr-10"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(validatePassword(e.target.value));
            }}
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute inset-y-0 right-0 flex items-center px-3"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-6 w-6 text-gray-600" />
            ) : (
              <EyeIcon className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>
        {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
        {generalError && <p className="text-red-500">{generalError}</p>}
        {Object.values(errors).length > 0 && (
          <div className="text-red-500">
            {Object.values(errors).map((error, index) => (
              <p key={index} className="text-sm">{error}</p>
            ))}
          </div>
        )}

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
