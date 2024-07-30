import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SignUp from "../components/Signup";
import SignIn from "../components/Signin";

export const Auth = () => {
  const [view, setView] = useState("initial");

  const handleSignUpClick = () => {
    setView("signup");
  };

  const handleSignInClick = () => {
    setView("signin");
  };

  const handleGoBack = () => {
    setView("initial");
  };

  return (
    <div className=" h-screen overflow-hidden bg-[#1e1e2b]">
      <div className=" inset-0 bg-[#1e1e2b] "></div>

      <AnimatePresence>
        {view === "initial" && (
          <motion.div
            key="initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative flex flex-col justify-center items-center h-full z-10"
          >
            <p className="font-sans text-5xl text-white font-bold mb-8">
              Let's get started
            </p>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={handleSignUpClick}
                className="text-gray-900 bg-white border hover:bg-gray-100 focus:ring-4 focus:ring-white-100 font-medium rounded-full text-sm px-5 py-2.5"
              >
                Sign up
              </button>
              <button
                type="button"
                onClick={handleSignInClick}
                className="text-gray-900 bg-white border hover:bg-gray-100 focus:ring-4 focus:ring-white-100 font-medium rounded-full text-sm px-5 py-2.5"
              >
                Sign in
              </button>
            </div>
          </motion.div>
        )}

        {view === "signup" && (
          <SignUp handleGoBack={handleGoBack} />
        )}

        {view === "signin" && (
          <SignIn handleGoBack={handleGoBack} />
        )}
      </AnimatePresence>
    </div>
  );
};
