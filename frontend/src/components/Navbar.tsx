import { Link } from "react-router-dom";
import '../index.css';
import { Mode } from "./Mode";

export const Navbar = () => {
    return (
        <div className="flex justify-between items-center mx-auto bg-background dark:bg-background px-8 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="w-44">
                <Link to="/">
                    <img src="/images/linksylogo.png" alt="Linksy" className="w-full" />
                </Link>
            </div>
            <div className="flex">
                <ul className="flex space-x-8 font-semibold text-xl">
                    <li>
                        <Link to="/services" className="text-text dark:text-text hover:underline">
                            Services
                        </Link>
                    </li>
                    <li>
                        <Link to="/your-gains" className="text-text dark:text-text hover:underline">
                            Your Gains
                        </Link>
                    </li>
                    <li>
                        <Link to="/process" className="text-text dark:text-text hover:underline">
                            Process
                        </Link>
                    </li>
                    <li>
                        <Link to="/faq" className="text-text dark:text-text hover:underline">
                            FAQ
                        </Link>
                    </li>
                </ul>
            </div>
            <div className="flex">
                <button type="button" className="text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-4 focus:ring-accent-dark font-medium rounded-full text-sm px-5 py-2.5 mr-3">
                    Sign up
                </button>
                <Mode/>
            </div>
            
        </div>
    );
};
