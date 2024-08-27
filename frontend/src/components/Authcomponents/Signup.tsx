import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import Cookies from "js-cookie";
import { useAuth } from "../../Context/Authcontext";
import { SignupType } from "@jaimil/linksy";
import { Role } from "./Role";
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
    setLoading(true); // Show loading spinner
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
    } catch (error) {
      console.error("Sign-up error:", error);
      alert("Error while signing up");
    } finally {
      setLoading(false); // Hide loading spinner
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
          <p className="font-sans text-5xl text-white font-bold mb-8 mt-5">
            Create an Account
          </p>
          <form
            className="flex flex-col gap-4 w-full max-w-md px-10"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              placeholder="Name"
              className="p-2 rounded bg-white text-gray-900"
              value={postInputs.name}
              onChange={(e) =>
                setPostInputs({ ...postInputs, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Contact No."
              className="p-2 rounded bg-white text-gray-900"
              value={postInputs.contactNo}
              onChange={(e) =>
                setPostInputs({ ...postInputs, contactNo: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email"
              className="p-2 rounded bg-white text-gray-900"
              value={postInputs.email}
              onChange={(e) =>
                setPostInputs({ ...postInputs, email: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              className="p-2 rounded bg-white text-gray-900"
              value={postInputs.password}
              onChange={(e) =>
                setPostInputs({ ...postInputs, password: e.target.value })
              }
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
                "Sign Up"
              )}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default SignUp;
