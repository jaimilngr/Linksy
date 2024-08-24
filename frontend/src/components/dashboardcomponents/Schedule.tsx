export const Schedule = () => {
    // Example schedule data
    const schedule = [
      { id: 1, date: "2024-08-25", time: "10:00 AM", details: "Meeting with client" },
      { id: 2, date: "2024-08-26", time: "02:00 PM", details: "Project review" },
    ];
  
    return (
      <div>
        <h3 className="text-2xl font-semibold mb-6">Schedule</h3>
        <div className="space-y-4">
          {schedule.map((item) => (
            <div
              key={item.id}
              className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm text-black"
            >
              <h4 className="text-lg font-medium mb-2">{item.date}</h4>
              <p>{item.time}</p>
              <p>{item.details}</p>
            </div>
          ))}
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded mt-4">
          Add New Schedule
        </button>
      </div>
    );
  };
  