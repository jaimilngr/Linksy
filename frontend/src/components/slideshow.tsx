import { useState, useEffect } from "react";

const slides = [
  "/images/slide1.png", 
  "/images/slide2.png",
  "/images/slide3.png",
];

export function Slideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 6000);

    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) return 0;
        return prevProgress + 100 / 60;
      });
    }, 100);

    return () => {
      clearInterval(slideInterval);
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full  mt-9 flex items-center justify-center bg-[#171722] overflow-x-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
          <div className="text-white text-lg">Loading...</div>
        </div>
      )}
      <div className="relative w-full h-full overflow-hidden">
        <div className="mx-32 py-5">
          <div className="top-0 left-0 w-full h-1 bg-gray-300">
            <div
              className="h-full bg-blue-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div
          className="flex transition-transform duration-1000"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0 p-10">
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <img
                  src={slide}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}