export const Password = () => (
    <div>
      <h3 className="text-2xl font-semibold mb-6">Change Password</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm ">Current Password</label>
          <input
            type="password"
            placeholder="********"
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm ">New Password</label>
          <input
            type="password"
            placeholder="********"
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm ">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="********"
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Update Password
        </button>
      </div>
    </div>
  );
  