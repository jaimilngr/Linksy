import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

export const Mode = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div>
      <button 
        onClick={() => setDarkMode(!darkMode)} 
        className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
        {darkMode ? (
          <SunIcon className="w-6 h-6 text-yellow-500" />
        ) : (
          <MoonIcon className="w-6 h-6 text-gray-800 dark:text-gray-300" />
        )}
      </button>
    </div>
  );
};
