import { useState } from "react";
import { Link } from "react-router-dom";
import "../index.css";
import { Mode } from "./Mode";
import { Link as ScrollLink } from "react-scroll";
export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { to: "/", label: "Services", current: true },
    { to: "your-Gains", label: "Your Gains" },
    { to: "process", label: "Process" },
    { to: "#", label: "FAQ" },
  ];

  return (
    <nav className="  z-20 top-0 start-0 border-b border-gray-400 bg-background dark:bg-background sticky ">
      <div className=" flex flex-wrap items-center justify-between  py-5 px-6 ">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl font-bold whitespace-nowrap sm:text-4xl">
            Linksy
          </span>
        </a>
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <div className="self-center">

        <Mode />
          </div>
          <div className="">

        <Link to={"/signup"}>      
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-full px-4   text-md md:ml-3 py-2 md:text-[18px] "
            >
            Sign up
          </button>
            </Link>
              </div>
          
          <button
            onClick={handleToggle}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-expanded={isOpen}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
        <div
          className={`absolute top-full right-0  w-full md:w-auto md:flex md:items-center md:justify-between md:relative md:bg-background md:dark:bg-background  ${
            isOpen ? "block border-zinc-200 border-t-2" : "hidden " 
          }`}
          aria-expanded={isOpen}
        >
          <ul className="flex flex-col text-xl p-4 md:p-0 bg-background  text-right font-light rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0  dark:bg-background z-50">
            {navItems.map((item, index) => (
              <li key={index} className="relative group">
                <ScrollLink
                  to={item.to}
                  className={`block py-2 px-3 rounded md:bg-transparent md:p-0 ${
                    item.current
                      ? " text-blue-700"
                      : " dark:text-gray-300 hover:text-blue-700"
                  }`}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.label}
                  {!item.current && (
                    <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-500 transform scale-x-0 transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
                  )}
                </ScrollLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};
