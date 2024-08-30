import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { categories } from '../../data/categories';

function Hero() {
  const popularServices = [
    "Tech",
    "Cleaning",
    "AC Service",
    "Catering",
    "Laptop Repair",
  ];

  

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const navigate = useNavigate();

  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setDropdownVisible(e.target.value.length > 0);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/categories/${searchQuery}`);
    }
  };

  return (
    <div className="flex items-center justify-center flex-col w-full py-10 md:py-36 border-zinc-300 border-b-2">
      <div className="text-2xl font-bold sm:text-5xl lg:text-6xl text-text text-center whitespace-pre-line">
        Discover, Connect, and Engage {"\n"}
        with Top-Quality <span className="text-accent">Services</span> {"\n"}
        Tailored Just for You.
      </div>

      <div className="sm:w-6/12 mt-10 relative">
        <label
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
          htmlFor="search"
        >
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="search"
            value={searchQuery}
            onChange={handleSearchChange}
            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search for a service"
            required
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchSubmit();
              }
            }}
          />
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Search
          </button>
        </div>
        {isDropdownVisible && (
          <ul className="absolute z-10 w-full bg-white dark:bg-[#384454] border border-gray-300 rounded-lg shadow-md mt-1 max-h-60 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-sky-50 dark:hover:bg-gray-500 cursor-pointer"
                  onClick={() => {
                    setSearchQuery(category);
                    setDropdownVisible(false);
                    navigate(`/categories/${category}`);
                  }}
                >
                  {category}
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-500">No services found</li>
            )}
          </ul>
        )}
      </div>

      <div className="rounded-sm p-5 flex-wrap gap-2 items-center justify-center sm:flex">
        <div className="text-lg font-semibold">Popular:</div>
        
        
        {popularServices.map((service, index) => (
        <Link to={`/categories/${service}`}>
          <button
          key={index}
          className="bg-blue-500 text-white py-1 px-3 text-xs rounded-full mr-1 hover:bg-blue-600 md:py-2 md:px-4 md:text-sm"
          >
            {service}
          </button>
        </Link>
        ))}
      </div>
    </div>
  );
}

export default Hero;
