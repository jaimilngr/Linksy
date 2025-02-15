import { useState, useEffect } from "react";

const sortOptionsList = [
  { label: "Rating", value: "rating_" },
  { label: "Review Count", value: "reviews_" },
  { label: "Price", value: "price_" },
];

const SortDropdown = ({
  sortOptions,
  setSortOptions,
}: {
  sortOptions: string[];
  setSortOptions: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sortingOrder, setSortingOrder] = useState<Record<string, "asc" | "desc">>({
    rating_: "desc",
    reviews_: "desc",
    price_: "desc",
  });
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedOption, setSelectedOption] = useState<string>("Sort By");

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setIsOpen(!isOpen);
  };

  const toggleSortOption = (option: string) => {
    const order = sortingOrder[option];
    const fullOption = `${option}${order}`;
    
    setSortOptions((prev) => {
      const updatedOptions = prev.includes(fullOption)
        ? prev.filter((item) => item !== fullOption)
        : [...prev, fullOption];
      return updatedOptions;
    });

    const optionLabel = sortOptionsList.find((item) => item.value === option)?.label;
    if (optionLabel) {
      setSelectedOption(optionLabel);
    }
  };

  const toggleOrder = (option: string) => {
    const newOrder = sortingOrder[option] === "asc" ? "desc" : "asc";
    
    setSortingOrder((prev) => ({
      ...prev,
      [option]: newOrder
    }));

    setSortOptions((prev) => {
      const oldOption = `${option}${sortingOrder[option]}`;
      const newOption = `${option}${newOrder}`;
      
      if (prev.includes(oldOption)) {
        return prev.map(opt => opt === oldOption ? newOption : opt);
      }
      return prev;
    });
  };

  const handleClickOutside = (e: MouseEvent) => {
    const dropdown = document.getElementById("dropdown");
    const button = document.getElementById("dropdown-button");
    
    // Close only if click is outside both the dropdown and button
    if (
      dropdown && 
      !dropdown.contains(e.target as Node) && 
      button && 
      !button.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const queryParams: Record<string, string> = {};

    if (sortOptions.length > 0) {
      queryParams.sortBy = sortOptions.join(",");
    }

    if (minPrice > 0) {
      queryParams.price_min = minPrice.toString();
    }

    if (maxPrice < 1000) {
      queryParams.price_max = maxPrice.toString();
    }

    console.log("Sort Options:", sortOptions);
    console.log("Updated Query Params:", queryParams);
  }, [sortOptions, sortingOrder, minPrice, maxPrice]);

  // OK Button handler to apply min/max filter and preserve asc/desc
  const handleOkClick = () => {
    setSortOptions((prev) => {
      // Ensure ascending or descending order is maintained after OK click
      const updatedOptions = prev.filter(option => {
        // Remove price options with old min/max values before adding new ones
        return !option.startsWith("price_");
      });
      if (minPrice > 0 || maxPrice < 1000) {
        updatedOptions.push(`price_${sortingOrder.price_}`);
      }
      return updatedOptions;
    });
  };

  return (
    <div className="relative w-28 sm:w-48">
      <button
        id="dropdown-button"
        onClick={toggleDropdown}
        className="flex items-center justify-between w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-[#374151] cursor-pointer"
      >
        <span>{selectedOption}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          id="dropdown"
          className="absolute right-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-10 dark:bg-[#374151] overflow-hidden"
        >
          {sortOptionsList.map((option) => (
            <div
              key={option.value}
              className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer dark:hover:bg-[#575c63]"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={sortOptions.includes(`${option.value}${sortingOrder[option.value]}`)}
                  onChange={() => toggleSortOption(option.value)}
                  className="mr-2"
                />
                <span onClick={() => toggleSortOption(option.value)}>{option.label}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOrder(option.value);
                }}
              >
                {sortingOrder[option.value] === "asc" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25"
                    />
                  </svg>
                )}
              </button>
            </div>
          ))}

          {sortOptions.some(opt => opt.startsWith('price_')) && (
            <div className="px-4 py-2 bg-gray-100 dark:bg-[#575c63]">
              <div className="flex flex-col space-y-2">
                <div>
                  <label className="block mb-1">Min Price:</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="p-1 border rounded-md w-full"
                    placeholder="Min Price"
                  />
                </div>
                {minPrice > 0 && (
                  <div>
                    <label className="block mb-1">Max Price:</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="p-1 border rounded-md w-full"
                      placeholder="Max Price"
                    />
                  </div>
                )}
                <button
                  onClick={handleOkClick}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
