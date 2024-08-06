import { useState } from "react";
import { motion } from "framer-motion";

type RoleType = "user" | "service";

interface RoleProps {
  onRoleSelect: (role: RoleType) => void;
}

export const Role = ({ onRoleSelect }: RoleProps) => {
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);

  const handleRoleClick = (role: RoleType) => {
    setSelectedRole(role);
  };

  const handleContinueClick = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

  const cardClasses = (role: RoleType) =>
    `bg-white border-4 px-8 py-2 rounded-lg shadow-md flex flex-col items-center justify-center transition duration-300 ease-in-out ${
      selectedRole === role
        ? "bg-blue-100 border-green-600"
        : "border-blue-500 hover:bg-sky-100"
    }`;

  return (
    <div className=" relative h-screen w-full flex justify-center items-center">
      <div className="p-8 rounded-lg">
        <div className="flex justify-center mb-8">
          <h1 className="font-bold text-text text-3xl text-white  md:text-4xl text-center">Select your user Type</h1>
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
            <p className="text-center font-medium text-black text-lg">User</p>
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
            <p className="text-center font-medium text-black text-lg">Services</p>
          </motion.button>
        
        </div>
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={handleContinueClick}
            className=" bg-blue-700 text-black hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
