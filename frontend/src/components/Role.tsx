import { useState } from "react";
import { motion } from "framer-motion";

type RoleType = "user" | "service" | "admin";

export const Role = () => {
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);

  const handleRoleClick = (role: RoleType) => {
    setSelectedRole(role);
  };

  const cardClasses = (role: RoleType) =>
    `bg-white border-4 px-8 py-6 rounded-lg shadow-md flex flex-col items-center justify-center transition duration-300 ease-in-out ${
      selectedRole === role
        ? "bg-blue-100 border-green-600"
        : "border-blue-500 hover:bg-sky-100"
    }`;

  return (
    <div className="h-screen w-full flex justify-center items-center bg-[#171723]">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-center mb-8">
          <h1 className="font-bold text-3xl">Select your user Type</h1>
        </div>
        <div className="flex justify-center gap-6">
          <motion.button
            className={cardClasses("user")}
            onClick={() => handleRoleClick("user")}
            role="button"
            aria-pressed={selectedRole === "user"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <img
              width="64"
              height="64"
              src="https://img.icons8.com/windows/64/user-male-circle.png"
              alt="User Icon"
              className="mb-2"
            />
            <p className="text-center font-medium text-lg">User</p>
          </motion.button>
          <motion.button
            className={cardClasses("service")}
            onClick={() => handleRoleClick("service")}
            role="button"
            aria-pressed={selectedRole === "service"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <img
              width="50"
              height="50"
              src="https://img.icons8.com/ios/50/maintenance--v1.png"
              alt="Service Icon"
              className="mb-2"
            />
            <p className="text-center font-medium text-lg">Services</p>
          </motion.button>
          <motion.button
            className={cardClasses("admin")}
            onClick={() => handleRoleClick("admin")}
            role="button"
            aria-pressed={selectedRole === "admin"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <img
              width="50"
              height="50"
              src="https://img.icons8.com/ios/50/admin-settings-male.png"
              alt="Admin Icon"
              className="mb-2"
            />
            <p className="text-center font-medium text-lg">Admin</p>
          </motion.button>
        </div>
        <div className="flex justify-center mt-8">
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
