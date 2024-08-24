export const Profile = () => (
    <div>
      <h3 className="text-2xl font-semibold mb-6">Personal Information</h3>
      <div className="flex items-center space-x-4 mb-6">
        <img
          src="https://via.placeholder.com/100"
          alt="Profile"
          className="w-24 h-24 rounded-full bg-gray-500"
        />
        <div>
          <h4 className="text-lg font-medium">Jaimil</h4>
          <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
            Edit Profile
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex space-x-4">
          <div className="w-1/2">
            <label className="block text-sm ">First Name</label>
            <input
              type="text"
              placeholder="Jaimil"
              className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm ">Last Name</label>
            <input
              type="text"
              placeholder=""
              className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm ">Email</label>
          <input
            type="email"
            placeholder="nagarjaimil420@gmail.com"
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
            disabled
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </div>
    </div>
  );
  