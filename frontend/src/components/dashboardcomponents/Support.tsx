import { useState } from "react";
import { BACKEND_URL } from "../../config";
import axios from "axios";
import Cookies from "js-cookie";

export const Support = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(""); 
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = {
      name,
      email,
      subject, 
      message,
    };

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/user/send-email`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token") || ""}`, 
          },
        }
      );

      if (response.status) {
        setSuccessMessage("Your message has been sent successfully!");
        setErrorMessage("");
        setName("");
        setEmail("");
        setSubject(""); 
        setMessage("");
      } else {
        throw new Error("Failed to send the message.");
      }
    } catch (error) {
      setErrorMessage("There was an error sending your message. Please try again.");
      setSuccessMessage("");
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-6">Support</h3>
      <div className="space-y-4">
        <p>If you need any assistance, please reach out to our support team.</p>
        <p>Email: linksy.info@gmail.com</p>
      </div>

      {successMessage && <p className="text-green-600 mt-4">{successMessage}</p>}
      {errorMessage && <p className="text-red-600 mt-4">{errorMessage}</p>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={`dark:bg-[#404454] text-text border ${errorMessage ? 'border-red-500' : 'border-gray-300'} rounded w-full px-3 py-2`}
          />
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`dark:bg-[#404454] text-text border ${errorMessage ? 'border-red-500' : 'border-gray-300'} rounded w-full px-3 py-2`}
          />
        </div>
        <div>
          <label className="block mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className={`dark:bg-[#404454] text-text border ${errorMessage ? 'border-red-500' : 'border-gray-300'} rounded w-full px-3 py-2`}
          />
        </div>
        <div>
          <label className="block mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            className={`dark:bg-[#404454] text-text border ${errorMessage ? 'border-red-500' : 'border-gray-300'} rounded w-full px-3 py-2`}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};
