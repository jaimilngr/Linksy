function Hero() {

  const popularServices = [
    "Tech Support",
    "Cleaning",
    "AC Service",
    "Caterings",
    "Laptop Repair"
  ];
  
    return (
      <div className='flex items-center justify-center flex-col w-full py-10 md:py-36 border-zinc-300 border-b-2'>
        <div className='text-2xl font-bold sm:text-5xl lg:text-6xl  text-text text-center whitespace-pre-line'>
        Discover, Connect, and Engage {'\n'}
         with Top-Quality <span className="text-accent">Services </span>  {'\n'}
         Tailored Just for You.


        </div>
        <div className=" sm:w-6/12 mt-10">
          <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input type="search" id="search" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
            <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
          </div>
        </div>

        <div className="rounded-sm p-5 flex-wrap gap-2 items-center justify-center sm:flex">
  <div className="text-lg font-semibold">Popular:</div>
  {popularServices.map((service, index) => (
    <button
      key={index}
      className="bg-blue-500 text-white py-1 px-3 text-xs rounded-full mr-1 hover:bg-blue-600 md:py-2 md:px-4 md:text-sm"
    >
      {service}
    </button>
  ))}
</div>

    </div>
      
    );
    
  }
  
  export default Hero;
  