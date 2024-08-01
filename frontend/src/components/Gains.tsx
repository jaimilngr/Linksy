import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import '../styles.scss';

gsap.registerPlugin(ScrollTrigger);

const Card: React.FC = () => {
  const [flipped, setFlipped] = React.useState(false);

  const flip = () => setFlipped(!flipped);

  return (
    <div
      onMouseEnter={flip}
      onMouseLeave={flip}
      className={`card-container ${flipped ? 'flipped' : ''}`}
    >
      <div className="front">
        <div className="image-container">
          <img
            className="card-image"
            src="https://78.media.tumblr.com/d98fb931adb117c70f0dbced9e947520/tumblr_pe582mbWip1tlgv32o1_1280.png"
            alt="Blog"
          />
          <p className="title">Title</p>
        </div>
        <div className="main-area">
          <div className="blog-post">
            <p className="blog-content text-2xl">
              Jumpstart Your work Asap
            </p>
          </div>
        </div>
      </div>
      <div className="back">
        <p>
          Some sample text to demonstrate how these cards will work, including how they truncate long sentences. This section displays the full-length blog post.
        </p>
        <p>
          Bloggity bloggity bloggity blog. This would be the full text of the abbreviated blog post.
        </p>
      </div>
    </div>
  );
};

export const Gains: React.FC = () => {
    useEffect(() => {
        gsap.to("#js-slideContainer", {
          xPercent: -100 * 4, 
          ease: "none",
          scrollTrigger: {
            trigger: "#js-wrapper",
            start: "top 80px",
            end: `+=700`, 
            scrub: 1,
            snap: 2/ 4,
            markers: true
          },
        });
      }, []);
      
  return (
    <div className='flex flex-col justify-center items-center mt-8 '>
      <div className='text-4xl font-bold'>
        Your Gains
      </div>
      <div id="js-wrapper" className='relative overflow-hidden pl-72 top-0'>
        <div id="js-slideContainer" className='flex'>
          <Card />
          <Card />
          <Card />
          <Card />
        </div>
      </div>
    </div>
  );
};

export default Gains;
