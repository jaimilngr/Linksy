import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

export const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="border-t-2 border-gray-300">
      <div className="max-w-5xl mx-auto px-4 py-8 mb-10 ">
        <h1 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h1>
        <div className="space-y-6 md:p-0 p-3">
          {faqItems.map((item, index) => (
            <div key={index} className="border-b pb-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleToggle(index)}
              >
                <motion.h2
                  className={`text-xl md:text-2xl font-semibold transition-colors duration-300 ${
                    openIndex === index ? 'text-accent' : 'text'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }} 
                >
                  {item.question}
                </motion.h2>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }} 
                >
                  {openIndex === index ? (
                    <MinusIcon className="h-6 w-6 " />
                  ) : (
                    <PlusIcon className="h-6 w-6 " />
                  )}
                </motion.div>
              </div>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.p
                    className="mt-2 text-lg md:text-xl"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }} 
                  >
                    {item.answer}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const faqItems = [
  {
    question: "What is Linksy?",
    answer: "Linksy is an online platform that connects users with a variety of service providers. Whether you're looking for freelance work, professional services, or local help, our marketplace offers a range of options to suit your needs."
  },
  {
    question: "How do I create an account?",
    answer: "To create an account, click on the 'Sign Up' button on our Navbar. You'll need to provide some basic information including your name, email, and a password. After submitting the form, you will receive a verification email to confirm your registration."
  },
  {
    question: "How do I find a service provider?",
    answer: "You can search for service providers using the search bar on our homepage. Enter relevant keywords, select your desired category, or filter by location to find providers that match your needs."
  },
  {
    question: "How can I leave a review for a service provider?",
    answer: "After using a service, you'll be prompted to provide feedback. You'll be asked to leave a review and rate your experience. Your feedback will be valuable in helping other users make informed decisions."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept various payment methods including credit/debit cards and secure online payment gateways. For more details on accepted payment options, please visit our payment page or contact our support team."
  },
  {
    question: "How do I contact customer support?",
    answer: "If you need assistance, you can email our customer support team at linksy.info@gmail.com, and we'll be happy to help."
  },
  {
    question: "Can I become a service provider?",
    answer: "Yes, you can sign up as a service provider by clicking on the 'Sign Up' button and selecting 'Service Provider' during registration. Once your account is created, you'll be able to list your services and start receiving requests."
  }
];
