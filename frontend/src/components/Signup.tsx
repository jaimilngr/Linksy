import { motion } from "framer-motion";
import { useState } from "react";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SignupType } from "@jaimil/linksy";
import { Role } from "./Role";

interface SignUpProps {
  handleGoBack: () => void;
}

type RoleType = "user" | "service" ;

const SignUp = ({ handleGoBack }: SignUpProps) => {
  const navigate = useNavigate();
  const [postInputs, setPostInputs] = useState<SignupType>({
    name: "",
    contactNo: "",
    email: "",
    password: "",
    mode: "",
  });
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [showSignUp, setShowSignUp] = useState<boolean>(false);

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    setShowSignUp(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRole) {
      alert("Please select a role");
      return;
    }
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
        ...postInputs,
        role: selectedRole,
      });
      const { jwt, name, id } = response.data;

      localStorage.setItem("token", jwt);
      localStorage.setItem("username", name);
      localStorage.setItem("uid", id);

      navigate("/", { replace: true });
    } catch (e) {
      alert("Error while signing up");
    }
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
          <p className="font-sans text-4xl text-white font-bold mb-8 mt-5 md:text-5xl">
            Enter your details
          </p>
          <form
            className="flex flex-col gap-4 w-full max-w-md px-10"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              placeholder="Name"
              className="p-2 rounded bg-white text-gray-900"
              onChange={(e) =>
                setPostInputs((c: any) => ({ ...c, name: e.target.value }))
              }
            />
            <input
              type="number"
              placeholder="Contact no"
              className="p-2 rounded bg-white text-gray-900"
              onChange={(e) =>
                setPostInputs((c: any) => ({ ...c, contactNo: e.target.value }))
              }
            />
            <input
              type="email"
              placeholder="Email"
              className="p-2 rounded bg-white text-gray-900"
              onChange={(e) =>
                setPostInputs((c: any) => ({ ...c, email: e.target.value }))
              }
            />
            <input
              type="password"
              placeholder="Password"
              className="p-2 rounded bg-white text-gray-900"
              onChange={(e) =>
                setPostInputs((c: any) => ({ ...c, password: e.target.value }))
              }
            />
            {selectedRole === "service" && (
              <>
                <select
                  id="mode"
                  className="text-gray-700 text-md rounded-lg block w-full p-2.5"
                  onChange={(e) =>
                    setPostInputs((prev: any) => ({
                      ...prev,
                      mode: e.target.value, 
                    }))
                  }
                >
                  <option value="" disabled selected>
                    Select Preferred Mode of Service
                  </option>
                  <option value="offline">OFFLINE / ONSIGHT</option>
                  <option value="online">ONLINE</option>
                </select>
              </>
            )}
            <p className="text-gray-50">Password must have 6 characters</p>
            <button
              type="submit"
              className="text-white bg-blue-600 border border-blue-700 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 font-medium rounded-full text-sm px-5 py-2.5"
            >
              Sign Up
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default SignUp;
