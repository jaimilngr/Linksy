import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Draggable from 'gsap/Draggable';
import '../../styles.scss';

gsap.registerPlugin(ScrollTrigger, Draggable);

interface CardProps {
  content: string;
  imageUrl: string;
  points: string[];
  bgColor: string;
  isMobile: boolean;
  flipped: boolean;
  onFlip: (flipState: boolean) => void;
}

const Card: React.FC<CardProps> = ({ content, imageUrl, points, bgColor, isMobile, flipped, onFlip }) => {
  return (
    <div
      onMouseEnter={() => !isMobile && onFlip(true)}
      onMouseLeave={() => !isMobile && onFlip(false)}
      onClick={() => isMobile && onFlip(!flipped)}
      className={`card-container ${flipped ? 'flipped' : ''} ${isMobile ? 'mobile' : ''}`}
    >
      <div className="front" style={{ backgroundColor: bgColor }}>
        <img className="card-image-full" src={imageUrl} alt="Card Image" />
      </div>
      <div className="back flex flex-col justify-between" style={{ backgroundColor: bgColor }}>
        <ul>
          {points.map((point, index) => (
            <li key={index} className="point text-2xl pt-2">
              {point}
            </li>
          ))}
        </ul>
        <p className="content text-5xl font-semibold">{content}</p>
      </div>
    </div>
  );
};

interface CardData {
  content: string;
  imageUrl: string;
  points: string[];
  bgColor: string;
}

export const Gains: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [flippedStates, setFlippedStates] = useState<boolean[]>(Array(4).fill(false));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const slideContainer = "#js-slideContainer";
    const wrapper = "#js-wrapper";

    gsap.to(slideContainer, {
      xPercent: -50 * (4 - 2),
      ease: "none",
      duration: 2,
      scrollTrigger: {
        trigger: wrapper,
        scroller: "body",
        start: "top 150px",
        end: `+= ${500 * 4}`,
        scrub: 2,
      },
    });
  }, []);

  const cardData: CardData[] = [
    {
      content: 'Fast Service Discovery',
      imageUrl: './images/Discovery.png',
      points: [
        'Quickly find and connect with the most relevant service providers, enhancing your service experience and saving time.',
      ],
      bgColor: '#c1ff72',
    },
    {
      content: 'Retail Expertise',
      imageUrl: '/images/Expertise.png',
      points: [
        'Enjoy a seamless and user-friendly interface that mimics a retail-like experience for finding and engaging with service providers.',
      ],
      bgColor: '#cb6ce6',
    },
    {
      content: 'Save Time and Effort',
      imageUrl: '/images/Savetime.png',
      points: [
        'Efficiently manage your service requests and provider interactions, reducing the time and effort required to get the help you need.',
      ],
      bgColor: '#e4e0d5',
    },
    {
      content: 'Instant Updates',
      imageUrl: '/images/Updates.png',
      points: [
        'Receive real-time updates on your connections and interactions, ensuring you stay informed and can act promptly.',
      ],
      bgColor: '#f14424',
    },
  ];

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleFlip = (index: number, state: boolean) => {
    const newFlippedStates = [...flippedStates];
    newFlippedStates[index] = state;
    setFlippedStates(newFlippedStates);
  };

  return (
    <div className='flex flex-col justify-center items-center mt-8'>
      <div className='text-4xl justify-center flex font-bold'>Your Gains</div>
      <div id="js-wrapper" className='relative overflow-hidden'>
        <div id="js-slideContainer" className={`flex ${isMobile ? 'overflow-hidden' : ''} text-black`}>
          {isMobile ? (
            <Card
              content={cardData[currentIndex].content}
              imageUrl={cardData[currentIndex].imageUrl}
              points={cardData[currentIndex].points}
              bgColor={cardData[currentIndex].bgColor}
              isMobile={isMobile}
              flipped={flippedStates[currentIndex]}
              onFlip={(state) => handleFlip(currentIndex, state)}
            />
          ) : (
            cardData.map((card, index) => (
              <Card
                key={index}
                content={card.content}
                imageUrl={card.imageUrl}
                points={card.points}
                bgColor={card.bgColor}
                isMobile={isMobile}
                flipped={flippedStates[index]}
                onFlip={(state) => handleFlip(index, state)}
              />
            ))
          )}
        </div>
      </div>
      {isMobile && (
        <div className='flex justify-center mt-4 mb-8'>
          {cardData.map((_, index) => (
            
            <div
              key={index}
              onClick={() => handleDotClick(index)}
              className={`dot mx-2 cursor-pointer ${currentIndex === index ? 'active' : ''}`}
              style={{
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                backgroundColor: currentIndex === index ? '#2458b7' : '#ccc',
              }}
            />
            
          ))}


        </div>
      )}
    </div>
  );
};

export default Gains;
