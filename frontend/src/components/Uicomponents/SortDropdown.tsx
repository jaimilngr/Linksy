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
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("Sort By");

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
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

    setIsOpen(false); // Close dropdown after selection
  };

  const toggleOrder = (option: string) => {
    const newOrder = sortingOrder[option] === "asc" ? "desc" : "asc";

    setSortingOrder((prev) => ({
      ...prev,
      [option]: newOrder,
    }));

    setSortOptions((prev) => {
      const oldOption = `${option}${sortingOrder[option]}`;
      const newOption = `${option}${newOrder}`;

      if (prev.includes(oldOption)) {
        return prev.map((opt) => (opt === oldOption ? newOption : opt));
      }
      return prev;
    });
  };

  const handleClickOutside = (e: MouseEvent) => {
    const dropdown = document.getElementById("dropdown");
    const button = document.getElementById("dropdown-button");

    if (dropdown && !dropdown.contains(e.target as Node) && button && !button.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePriceChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    const formattedValue = value.replace(/^0+/, ""); // Remove leading zeros
    setter(formattedValue);
  };

  const handleOkClick = () => {
    setSortOptions((prev) => {
      const updatedOptions = prev.filter(
        (option) => !option.startsWith("price_") && !option.startsWith("price_min") && !option.startsWith("price_max")
      );

      if (sortingOrder.price_) {
        updatedOptions.push(`price_${sortingOrder.price_}`);
      }

      if (minPrice) {
        updatedOptions.push(`price_min:${minPrice}`);
      }

      if (maxPrice) {
        updatedOptions.push(`price_max:${maxPrice}`);
      }

      // Instead of updating the URL, you can use the queryParams here for the API call
      const queryParams: Record<string, string> = {};

      if (updatedOptions.length > 0) {
        queryParams.sortBy = updatedOptions.join(",");
      }

      if (minPrice) queryParams.minPrice = minPrice;
      if (maxPrice) queryParams.maxPrice = maxPrice;

      console.log("Updated Query Params:", queryParams);
      // Send queryParams in your API request, e.g., call API to fetch filtered data
      // apiCall(queryParams);

      return updatedOptions;
    });

    setIsOpen(false); // Close dropdown after applying filters
  };

  return (
    <div className="relative w-28 sm:w-48">
      <button
        id="dropdown-button"
        onClick={toggleDropdown}
        className="flex items-center justify-between w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-[#374151] cursor-pointer"
      >
        <span>{selectedOption}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
        </svg>
      </button>

      {isOpen && (
        <div id="dropdown" className="absolute right-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-10 dark:bg-[#374151] overflow-hidden">
          {sortOptionsList.map((option) => (
            <div key={option.value} className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer dark:hover:bg-[#575c63]">
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
                {sortingOrder[option.value] === "asc" ? "↑" : "↓"}
              </button>
            </div>
          ))}

          {sortOptions.some((opt) => opt.startsWith("price_")) && (
            <div className="px-4 py-2 bg-gray-100 dark:bg-[#374151]">
              <div className="flex flex-col space-y-2">
                <div>
                  <label className="block mb-1">Min Price:</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => handlePriceChange(setMinPrice, e.target.value)}
                    className="p-1 border rounded-md w-full dark:text-black"
                    placeholder="₹ 0"
                  />
                </div>
                <div>
                  <label className="block mb-1">Max Price:</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => handlePriceChange(setMaxPrice, e.target.value)}
                    className="p-1 border rounded-md w-full dark:text-black"
                    placeholder="₹ 1000"
                  />
                </div>
                <button onClick={handleOkClick} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md">
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
