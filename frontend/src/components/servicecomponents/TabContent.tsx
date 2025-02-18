import React from "react";
import { CommentsSection } from "./CommentSection";

interface TabContentProps {
  activeTab: string;
  service: any;
  id: string;
}

export const TabContent: React.FC<TabContentProps> = ({ activeTab, service, id }) => {
  switch (activeTab) {
    case "overview":
      return (
        <div className="rounded-lg">
          <p className="text-lg mb-4">{service.description}</p>
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Contact Info</h3>
            <p className="text-lg mb-1">
              <strong>Timing:</strong> {service.timing}
            </p>
            <p className="text-lg mb-1">
              <strong>Contact:</strong> {service.contactNo}
            </p>
          </div>
        </div>
      );
    case "reviews":
      return (
        <div className="rounded-lg">
          <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-600 pb-2">
            Reviews
          </h2>

          {service.reviews && service.reviews.length > 0 ? (
            service.reviews.map((review: any) => (
              <div
                key={review.id}
                className="mb-4 p-4 border border-gray-200 rounded-lg bg-[#c3ccd6] dark:bg-background hover:shadow-lg transition-shadow duration-200 ease-in-out"
              >
                <span className="font-bold text-lg">
                  {review.ticket.user.name || review.ticket.provider.name} :
                </span>{" "}
                <span> {review.comment}</span>
              </div>
            ))
          ) : (
            <p>No reviews available.</p>
          )}
        </div>
      );
    case "comment":
      return (
        <div className="rounded-lg">
          <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-600 pb-2">
            Comment
          </h2>

          <p className="text-lg mb-4">
            {" "}
            <CommentsSection serviceId={id} />
          </p>
        </div>
      );
    case "map":
      return (
        <div className="rounded-lg flex flex-col">
          <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-600 pb-2">
            Map
          </h2>

          <p className="text-lg mb-4 text-center">{service.mapLocation}</p>
          <div className="flex justify-center items-center">
            {service.latitude && service.longitude ? (
              <>
                <iframe
                  width="1000"
                  height="370"
                  style={{ border: "0" }}
                  scrolling="no"
                  src={`https://maps.google.com/maps?q=${service.latitude},${service.longitude}&hl=en&z=14&output=embed`}
                ></iframe>
                <br />
              </>
            ) : (
              <p>No location available.</p>
            )}
          </div>
        </div>
      );

    case "availability":
      return (
        <div className="rounded-lg">
          <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-600 pb-2">
            Availability
          </h2>
          <p
            className={`text-lg mb-4 ${
              service.availability === "yes"
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {service.availability === "yes" ? "Available" : "Not Available"}
          </p>{" "}
        </div>
      );
    default:
      return <div className="rounded-lg">Select a tab to view content.</div>;
  }
};