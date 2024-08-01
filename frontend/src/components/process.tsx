export const Process = () => {
  return (
    <div className="flex justify-center items-center mt-8  border-zinc-300 border-b-2">
      <div className="flex items-center flex-col">
        <div className="font-semibold text-2xl text-orange-400">
          Working Process
        </div>
        <div className="font-bold text-5xl">
          How it <span className="text-accent">works </span>
        </div>
        <div className="flex m-5 lg:m-10 flex-col lg:flex-row   text-black ">
          <div className="flex justify-center items-left flex-col p-3 lg:p-10  bg-[#f9e7e4]  border-orange-400 border-2   rounded-2xl lg:mr-5 mb-4">
            <div className="flex font-bold text-2xl lg:text-4xl rounded-full bg-red-500 w-12 h-12 lg:w-20 lg:h-20 justify-center items-center mb-2 lg:mb-10">
              01
            </div>
            <div className="font-bold text-xl lg:text-4xl">Find and Choose a Service</div>
            <div className="font-light text-md lg:text-2xl text-wrap pt-2">
              Browse our service directory or use the search feature to find the
              service that best fits your needs. Once you’ve identified the
              right service, proceed to select it.
            </div>
          </div>
          <div className="flex justify-center items-left flex-col p-3 lg:p-10 bg-[#fef9ea] border-yellow-400 border-2 shadow-cyan-500/50  rounded-2xl lg:mr-5  mb-4">
            <div className="flex font-bold text-2xl lg:text-4xl rounded-full bg-yellow-500 w-12 h-12 lg:w-20 lg:h-20 justify-center items-center mb-2 lg:mb-10">
              02
            </div>
            <div className="font-bold text-xl lg:text-4xl">Submit a Request</div>
            <div className="font-light text-md lg:text-2xl text-wrap  pt-2">
              Fill out the request form with the necessary details and submit
              it. Our team will review your request and get in touch with you to
              confirm the next steps.
            </div>
          </div>
          <div className="flex justify-center items-left flex-col p-3 lg:p-10  bg-[#c9dbf5] border-cyan-400 border-2 shadow-cyan-500/50  rounded-2xl lg:mr-5 mb-4">
            <div className="flex font-bold text-2xl lg:text-4xl rounded-full bg-green-500 w-12 h-12 lg:w-20 lg:h-20 justify-center items-center mb-2 lg:mb-10">
              03
            </div>
            <div className="font-bold text-xl lg:text-4xl">Share Your Feedback</div>
            <div className="font-light text-md lg:text-2xl  text-wrap pt-2">
              After the service is completed, provide feedback on your
              experience. Your input helps us improve and ensures we continue to
              meet your expectations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
