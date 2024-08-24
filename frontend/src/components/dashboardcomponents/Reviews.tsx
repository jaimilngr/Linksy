export const Reviews = () => {
    // Example reviews data
    const reviews = [
      { id: 1, name: "Jaimil", review: "Excellent service, highly recommended!" },
      { id: 2, name: "Kushal", review: "Very satisfied with the quality." },
    ];
  
    return (
      <div>
        <h3 className="text-2xl font-semibold mb-6">Reviews</h3>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm"
            >
              <h4 className="text-lg font-medium mb-2 text-black">{review.name}</h4>
              <p className="text-black">{review.review}</p>
            </div>
          ))}
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded mt-4">
          Write a Review
        </button>
      </div>
    );
  };
  