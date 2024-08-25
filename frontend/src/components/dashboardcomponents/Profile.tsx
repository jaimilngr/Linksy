import  { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../config';

export const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (!profileData) {
      axios.get(`${BACKEND_URL}/api/v1/user/profile`)
        .then(response => {
          const { name, email } = response.data;
          setProfileData(response.data);
          setFormData({ name, email });
        })
        .catch(error => {
          console.error('Error fetching profile data:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [profileData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Implement save logic here, typically an API call to update the profile
    console.log('Saved data:', formData);
    setIsEditing(false);
  };

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-6">Personal Information</h3>
      <div className="flex items-center space-x-4 mb-6">
        <img
          src="https://via.placeholder.com/100"
          alt="Profile"
          className="w-24 h-24 rounded-full bg-gray-500"
        />
        <div>
          <h4 className="text-lg font-medium">{profileData.name}</h4>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-[#384454]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-[#384454]"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm">Name</label>
              <input
                type="text"
                value={profileData.name}
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-200 dark:bg-gray-700"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm">Email</label>
            <input
              type="email"
              value={profileData.email}
              readOnly
              className="w-full p-2 border border-gray-300 rounded bg-gray-200 dark:bg-gray-700"
            />
          </div>
        </div>
      )}
    </div>
  );
};
