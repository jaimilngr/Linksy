import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import Cookies from "js-cookie";
import { useAuth } from "../../Context/Authcontext";
import { SignupType } from "@jaimil/linksy";
import { Role } from "./Role";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface SignUpProps {
  handleGoBack: () => void;
}

type RoleType = "user" | "service";

const SignUp: React.FC<SignUpProps> = ({ handleGoBack }) => {
  const navigate = useNavigate();
  const { setAuthState } = useAuth();
  const [postInputs, setPostInputs] = useState<SignupType>({
    name: "",
    contactNo: "",
    email: "",
    password: "",
    mode: undefined,
  });
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [showSignUp, setShowSignUp] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState({
    name: "",
    contactNo: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    setShowSignUp(true);
  };

  const validateInputs = () => {
    let formIsValid = true;
    const newErrors = {
      name: "",
      contactNo: "",
      email: "",
      password: "",
    };

    if (!postInputs.name.trim()) {
      formIsValid = false;
      newErrors.name = "Name is required";
    }

    // Validate contact number
    const contactNoPattern = /^[0-9]{10}$/;
    if (!postInputs.contactNo.trim()) {
      formIsValid = false;
      newErrors.contactNo = "Contact No. is required";
    } else if (!contactNoPattern.test(postInputs.contactNo)) {
      formIsValid = false;
      newErrors.contactNo = "Contact No. must be exactly 10 digits";
    }

    if (!postInputs.email.trim()) {
      formIsValid = false;
      newErrors.email = "Email is required";
    }

    if (!postInputs.password.trim()) {
      formIsValid = false;
      newErrors.password = "Password is required";
    } else if (postInputs.password.length < 6) {
      formIsValid = false;
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return formIsValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRole) {
      alert("Please select a role");
      return;
    }

    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    setGeneralError(null); 
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
        ...postInputs,
        role: selectedRole,
      });

      const { jwt, name } = response.data;

      Cookies.set("token", jwt, { expires: 10 });
      Cookies.set("authUser", name, { expires: 10 });
      Cookies.set("role", selectedRole, { expires: 10 });

      setAuthState({
        authUser: name,
        isLoggedIn: true,
        role: selectedRole,
        token: jwt,
      });

      localStorage.setItem("needsAdditionalData", "true");

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPostInputs({ ...postInputs, password: newPassword });

    if (!newPassword.trim()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: "Password is required",
      }));
    } else if (newPassword.length < 6) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: "Password must be at least 6 characters",
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: "",
      }));
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="h-screen">
      {!showSignUp ? (
        <Role onRoleSelect={handleRoleSelect} />
      ) : (
        <motion.div
          key="signup"
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
          <p className="font-sans text-4xl md:text-5xl text-white font-bold mb-8 mt-5">
            Create an Account
          </p>
          <form
            className="flex flex-col gap-4 w-full max-w-md px-10"
            onSubmit={handleSubmit}
          >
            <div className="w-full">
              <input
                type="text"
                placeholder="Name"
                className={`p-2 w-full rounded bg-white text-gray-900 ${errors.name && "border-red-500 border"}`}
                value={postInputs.name}
                onChange={(e) =>
                  setPostInputs({ ...postInputs, name: e.target.value })
                }
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <div className="w-full">
              <input
                type="number"
                placeholder="Contact No."
                className={`p-2 w-full rounded no-spinner bg-white text-gray-900 ${errors.contactNo && "border-red-500 border"}`}
                value={postInputs.contactNo}
                onChange={(e) =>
                  setPostInputs({ ...postInputs, contactNo: e.target.value })
                }
              />
              {errors.contactNo && (
                <p className="text-red-500 text-sm mt-1">{errors.contactNo}</p>
              )}
            </div>
            <div className="w-full">
              <input
                type="email"
                placeholder="Email"
                className={`p-2 w-full rounded bg-white text-gray-900 ${errors.email && "border-red-500 border"}`}
                value={postInputs.email}
                onChange={(e) =>
                  setPostInputs({ ...postInputs, email: e.target.value })
                }
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={`p-2 w-full rounded bg-white text-gray-900 ${errors.password && "border-red-500 border"}`}
                value={postInputs.password}
                onChange={handlePasswordChange}
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
            {errors.password && (
              <p className="text-red-500 text-md mt-[-10]">{errors.password}</p>
            )}
            {generalError && (
              <p className="text-red-500 text-md mt-1">{generalError}</p>
            )}
            <button
              type="submit"
              className={`w-full py-2 rounded text-white bg-blue-500 hover:bg-blue-600 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default SignUp;
