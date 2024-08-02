import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import '../styles.scss';

gsap.registerPlugin(ScrollTrigger);

const Card: React.FC<{ content: string; imageUrl: string; points: string[], bgColor: string }> = ({ content, imageUrl, points, bgColor }) => {
  const [flipped, setFlipped] = React.useState(false);

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

export const Gains: React.FC = () => {
  useEffect(() => {
    gsap.to("#js-slideContainer", {
      xPercent: -50 * (4 - 2),
      ease: "none",
      duration: 2,
      scrollTrigger: {
        trigger: "#js-wrapper",
        scroller: "body",
        start: "top 150px",
        end: `+= ${500 * 4}`,
        scrub: 2,
      },
    });
  }, []);

  const cardData = [
    {
      content: 'Fast Service Discovery',
      imageUrl: './public/images/Discovery.png',
      points: [
        'Quickly find and connect with the most relevant service providers, enhancing your service experience and saving time.'
      ],
      bgColor: '#c1ff72'
    },
    {
      content: 'Retail Expertise',
      imageUrl: './public/images/Expertise.png',
      points: [
        'Enjoy a seamless and user-friendly interface that mimics a retail-like experience for finding and engaging with service providers.',
      ],
      bgColor: '#cb6ce6'
    },
    {
      content: 'Save Time and Effort',
      imageUrl: './public/images/Savetime.png',
      points: [
        'Efficiently manage your service requests and provider interactions, reducing the time and effort required to get the help you need.'
      ],
      bgColor: '#e4e0d5'
    },
    {
      content: 'Instant Updates',
      imageUrl: './public/images/Updates.png',
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
        <div id="js-slideContainer" className='flex'>
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
    </div>
  );
};

export default Gains;
