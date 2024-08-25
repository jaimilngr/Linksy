import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import Cookies from 'js-cookie';

export const Profile = () => {
  const [profileData, setProfileData] = useState<{
    name: string;
    email: string;
    contactNo: string;
    address?: string; // Optional address field
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    contactNo: string;
    address?: string; // Optional address field
  }>({
    name: '',
    email: '',
    contactNo: '',
    address: '',
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = Cookies.get('token');
      const role = Cookies.get('role');

      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Role: `${role}`
          },
        });
        const { name, email, contactNo, address } = response.data;
        setProfileData({ name, email, contactNo, address });
        setFormData({ name, email, contactNo, address });
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const token = Cookies.get('token');
    const role = Cookies.get('role');

    try {
      await axios.put(`${BACKEND_URL}/api/v1/user/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Role: `${role}`
        },
      });
      setProfileData(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsEditing(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const isUserRole = Cookies.get('role') === 'user';

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
          <h4 className="text-lg font-medium">{profileData?.name ?? 'No Name'}</h4>
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
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-[#384454]"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm">Contact Number</label>
              <input
                type="text"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-[#384454]"
              />
            </div>
          </div>
          {isUserRole && (
            <div>
              <label className="block text-sm">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address ?? ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-[#384454]"
              />
            </div>
          )}
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
                value={profileData?.name ?? 'No Name'}
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-200 dark:bg-gray-700"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm">Email</label>
              <input
                type="email"
                value={profileData?.email ?? 'No Email'}
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-200 dark:bg-gray-700"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm">Contact Number</label>
              <input
                type="text"
                value={profileData?.contactNo ?? 'No Contact Number'}
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-200 dark:bg-gray-700"
              />
            </div>
          </div>
          {isUserRole && (
            <div>
              <label className="block text-sm">Address</label>
              <input
                type="text"
                value={profileData?.address ?? 'No Address'}
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-200 dark:bg-gray-700"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
