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
}

const Card: React.FC<CardProps> = ({ content, imageUrl, points, bgColor }) => {
  const [flipped, setFlipped] = React.useState<boolean>(false);

  const flip = () => setFlipped(!flipped);

  return (
    <div
      onMouseEnter={flip}
      onMouseLeave={flip}
      className={`card-container ${flipped ? 'flipped' : ''}`}
    >
      <div className="front" style={{ backgroundColor: bgColor }}>
        <img
          className="card-image-full"
          src={imageUrl}
          alt="Card Image"
        />
      </div>
      <div className="back flex flex-col justify-between" style={{ backgroundColor: bgColor }}>
        <ul>
          {points.map((point, index) => (
            <li key={index} className="point text-2xl pt-2">
              {point}
            </li>
          ))}
        </ul>
        <p className="content text-5xl font-semibold">
          {content}
        </p>
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

    const draggables = Draggable.get(slideContainer);
    if (draggables) {
      if (Array.isArray(draggables)) {
        draggables.forEach(draggable => draggable.kill());
      } 
    }

    if (isMobile) {
      Draggable.create(slideContainer, {
        type: "x",
        bounds: wrapper,
        edgeResistance: 0.65,
        throwProps: true,
        onDrag: function() {
          gsap.set(slideContainer, { x: this.x });
        },
        onThrowUpdate: function() {
          gsap.set(slideContainer, { x: this.x });
        }
      });
    }

  }, [isMobile]);

  const cardData: CardData[] = [
    {
      content: 'Fast Service Discovery',
      imageUrl: './images/Discovery.png',
      points: [
        'Quickly find and connect with the most relevant service providers, enhancing your service experience and saving time.'
      ],
      bgColor: '#c1ff72'
    },
    {
      content: 'Retail Expertise',
      imageUrl: '/images/Expertise.png',
      points: [
        'Enjoy a seamless and user-friendly interface that mimics a retail-like experience for finding and engaging with service providers.',
      ],
      bgColor: '#cb6ce6'
    },
    {
      content: 'Save Time and Effort',
      imageUrl: '/images/Savetime.png',
      points: [
        'Efficiently manage your service requests and provider interactions, reducing the time and effort required to get the help you need.'
      ],
      bgColor: '#e4e0d5'
    },
    {
      content: 'Instant Updates',
      imageUrl: '/images/Updates.png',
      points: [
        'Receive real-time updates on your connections and interactions, ensuring you stay informed and can act promptly.'
      ],
      bgColor: '#f14424'
    }
  ];

  return (
    <div className='flex flex-col justify-center items-center mt-8'>
      <div className='text-4xl justify-center flex font-bold'>
        Your Gains
      </div>
      <div id="js-wrapper" className='relative overflow-hidden'>
        <div id="js-slideContainer" className='flex text-black'>
          {cardData.map((card, index) => (
            <Card
              key={index}
              content={card.content}
              imageUrl={card.imageUrl}
              points={card.points}
              bgColor={card.bgColor}
            />
          ))}
        </div>
      </div>
      <div className='md:hidden flex mb-7'>
        {cardData.map((_, index) => (
          <div
            key={index}
            className='dot w-3 h-3 rounded-full mx-2 bg-gray-400'
          />
        ))}
      </div>
    </div>
  );
};

export default Gains;
