import React, { useState } from 'react';

export const Footer = () => {
  const [responseMessage, setResponseMessage] = useState('');
  const [email, setEmail] = useState('');

  const handleSubscribe = (event: React.FormEvent) => {
    event.preventDefault();

    if (!email) {
      setResponseMessage('Please enter a valid email address.');
    } else {
      setResponseMessage('Thank you for subscribing to our newsletter!');
      setEmail(''); 
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-around bg-gradient-to-b from-blue-300 via-blue-500 to-blue-700 dark:bg-gradient-to-b dark:from-blue-500 dark:via-blue-700 dark:to-blue-900 py-8 px-4 md:px-8">
      
      {/* Brand Section */}
      <div className="text-center md:text-left mb-8 md:mb-0">
        <h1 className="text-2xl md:text-3xl font-bold">Linksy</h1>
        <p className="mt-3 max-w-xs mx-auto md:mx-0 text-sm md:text-base">
          Connecting you with skilled professionals to help your business grow.
        </p>
      </div>

      {/* Contact Information */}
      <div className="text-center md:text-left mb-8 md:mb-0">
        <h1 className="text-2xl md:text-3xl font-bold">Contact Info</h1>
        <div className="flex flex-col gap-4 mt-5 text-sm md:text-lg">
          <div className="flex items-center justify-center md:justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 md:w-6 md:h-6 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
            Ahmedabad, Gujarat
          </div>
          <div className="flex items-center justify-center md:justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 md:w-6 md:h-6 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
              />
            </svg>
            +91 82000 76383
          </div>
          <div className="flex items-center justify-center md:justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 md:w-6 md:h-6 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
            <p className="pl-1">jaimil.lxv@gmail.com</p>
          </div>
        </div>
      </div>

      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold">Subscribe to our Newsletter</h1>
        <p className="mt-3 text-sm md:text-base">
          Get the latest updates and offers straight to your inbox.
        </p>
        <form className="flex flex-col md:flex-row mt-5" onSubmit={handleSubscribe}>
          <input
            type="email"
            placeholder="Your Email"
            className="px-4 py-2  rounded-l-lg mb-2 text-black md:mb-0 focus:outline-none w-full md:w-auto"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg md:rounded-none md:rounded-r-lg hover:bg-slate-500 w-full md:w-auto">
            Subscribe
          </button>
        </form>
        {responseMessage && (
          <p className="mt-3 text-sm md:text-base text-green-500">
            {responseMessage}
          </p>
        )}
      </div>
    </div>
  );
};
