import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SignUp from "./Signup";
import SignIn from "./Signin";

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
    <div className="relative h-screen overflow-hidden ">
      <div className=" absolute inset-0  bg-[#333246] blur-2xl "></div>

      <AnimatePresence>
        {view === "initial" && (
          <motion.div
            key="initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative flex flex-col justify-center items-center h-screen z-10"
          >
            <p className="font-sans text-4xl text-white font-bold mb-8 md:text-5xl">
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
