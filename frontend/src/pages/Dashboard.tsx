import { useState } from "react";
import { Navbar } from "../components/Uicomponents/Navbar";
import { MyServices } from "../components/dashboardcomponents/myservicescomponents/MyServices";
import { Password } from "../components/dashboardcomponents/Password";
import { Profile } from "../components/dashboardcomponents/Profile";
import { Reviews } from "../components/dashboardcomponents/Reviews";
import { Schedule } from "../components/dashboardcomponents/Schedule";
import { Support } from "../components/dashboardcomponents/Support";
import { Ticket } from "../components/dashboardcomponents/Ticket";
import { useAuth } from "../Context/Authcontext";

const Dashboard = () => {
  const [selectedSection, setSelectedSection] = useState("Profile");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { role } = useAuth();

  const renderContent = () => {
    switch (selectedSection) {
      case "Profile":
        return <Profile />;
      case "Password":
        return <Password />;
      case "Service Ticket":
        return <Ticket />;
      case "My Services":
        return <MyServices />;
      case "Reviews":
        return <Reviews />;
      case "Schedule":
        return <Schedule />;
      case "Support":
        return <Support />;
      default:
        return <Profile />;
    }
  };

  const sections = {
    user: ["Profile", "Password", "Service Ticket", "Reviews", "Support"],
    service: [
      "Profile",
      "Password",
      "Service Ticket",
      "My Services",
      "Reviews",
      "Schedule",
      "Support",
    ],
  };

  const roleSections = role === "service" ? sections.service : sections.user;

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar for Desktop */}
        <aside className="hidden md:flex md:flex-col md:w-1/4 bg-slate-200 dark:bg-slate-800 p-6">
          <h2 className="text-xl font-semibold mb-4">Account settings</h2>
          <nav className="flex flex-col space-y-2">
            {roleSections.map((section) => (
              <button
                key={section}
                onClick={() => setSelectedSection(section)}
                className={`text-left py-2 px-4 rounded-lg transition-colors ${
                  selectedSection === section
                    ? "bg-secondary dark:bg-gray-700"
                    : "bg-background hover:bg-secondary dark:hover:bg-gray-700"
                }`}
              >
                {section}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content for Desktop */}
        <main className="md:w-3/4 p-8 bg-background hidden md:block">
          {renderContent()}
        </main>

        {/* Dropdown for Mobile */}
        <div className="md:hidden p-4 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Account Settings
          </h2>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full p-3 text-left bg-secondary text-white rounded-lg focus:outline-none flex justify-between"
            >
              {selectedSection}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className=" left-0 w-full mt-2  bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                {roleSections.map((section) => (
                  <button
                    key={section}
                    onClick={() => {
                      setSelectedSection(section);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {section}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="md:hidden mt-4 p-4 bg-background">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
