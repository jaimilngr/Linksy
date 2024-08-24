import { useState } from "react";

export const MyServices = () => {
    const [services, setServices] = useState([
      { id: 1, name: "Service 1", details: false },
      { id: 2, name: "Service 2", details: false },
    ]);
  
    const toggleDetails = (id) => {
      setServices((prevServices) =>
        prevServices.map((service) =>
          service.id === id
            ? { ...service, details: !service.details }
            : service
        )
      );
    };
  
    return (
      <div>
        <h3 className="text-2xl font-semibold mb-6">My Services</h3>
        <div className="space-y-4 text-black">
          {services.map((service) => (
            <div
              key={service.id}
              className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm"
            >
              <h4 className="text-lg font-medium mb-4">{service.name}</h4>
              <button
                onClick={() => toggleDetails(service.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
              >
                {service.details ? "Hide Details" : "Show Details"}
              </button>
              {service.details && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm ">Service Type</label>
                    <select className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900">
                      <option>Onsite</option>
                      <option>Online</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm ">Name</label>
                    <input
                      type="text"
                      placeholder="Service Name"
                      className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm ">Description</label>
                    <textarea
                      placeholder="Description"
                      className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm ">Price</label>
                    <input
                      type="text"
                      placeholder="Price"
                      className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm ">Timing</label>
                    <input
                      type="text"
                      placeholder="Timing"
                      className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm ">Category</label>
                    <select className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900">
                      <option>Category 1</option>
                      <option>Category 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm ">Images</label>
                    <input
                      type="file"
                      className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
                      multiple
                    />
                  </div>
                  <div>
                    <label className="block text-sm ">Location</label>
                    <input
                      type="text"
                      placeholder="Location"
                      className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm ">Contact No</label>
                    <input
                      type="text"
                      placeholder="Contact No"
                      className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
                    />
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  