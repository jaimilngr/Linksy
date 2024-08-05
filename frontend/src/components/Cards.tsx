import { motion } from "framer-motion";

type CardProps = {
  title: string;
  image: string;
};

const Card = ({ title, image }: CardProps) => {
  return (
    <motion.div
      className="flex flex-col justify-center items-center bg-[#e2e5ee] dark:bg-secondary py-3 md:py-4 shadow-md rounded-2xl aspect-w-1 aspect-h-1 mb-2"
      whileHover={{ scale: 1.1 }}
    >
      <img src={image} alt={title} className="mb-2 w-16 h-16 md:w-20 md:h-20" />
      <span className="text-center text-sm md:text-lg xl:text-xl font-semibold">{title}</span>
    </motion.div>
  );
};

export const Cards = () => {
  const cardData = [
    { title: "Tech", image: "https://img.icons8.com/color/100/workstation.png" },
    { title: "Cleaning", image: "https://img.icons8.com/office/100/housekeeping.png" },
    { title: "AC Service", image: "https://img.icons8.com/cotton/100/air-conditioner--v5.png" },
    { title: "Painting Contractor", image: "https://img.icons8.com/color/100/paint-brush.png" },
    { title: "Courier Service", image: "https://img.icons8.com/external-xnimrodx-lineal-color-xnimrodx/100/external-courier-distribution-xnimrodx-lineal-color-xnimrodx.png" },
    { title: "Catering", image: "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/100/external-catering-foodies-flaticons-lineal-color-flat-icons-3.png" },
    { title: "Event Organizer", image: "https://img.icons8.com/dusk/100/event-accepted.png" },
    { title: "Home Decor", image: "https://img.icons8.com/plasticine/100/home.png" },
    { title: "Laptop Repair", image: "https://img.icons8.com/clouds/100/laptop.png" },
    { title: "Consultant", image: "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/100/external-consultant-marketing-agency-flaticons-lineal-color-flat-icons.png" }
  ];

  const numberOfCardsToDisplay = window.innerWidth < 768 ? Math.min(cardData.length, 6) : cardData.length;

  return (
    <div className="flex justify-center items-center flex-col  dark:bg-inherit mt-8 border-zinc-200 border-b-2 pb-10">
      <div className="text-4xl font-bold text-green-500">
        Browse Services
      </div>
      <div className="grid grid-cols-3 px-10 md:grid-cols-5 lg:grid-cols-5 gap-4 mt-10">
        {cardData.slice(0, numberOfCardsToDisplay).map((data, index) => (
          <Card key={index} title={data.title} image={data.image} />
        ))}
      </div>
    </div>
  );
};
