import React, { useState } from 'react';
import { FaUserEdit } from 'react-icons/fa';

const ProfileSettings = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-6">Profile Settings</h2>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <img src="/vite.svg" alt="Default" className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center">
            <FaUserEdit className="mr-2" />
            Change Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          className="w-full p-2 border rounded mt-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          className="w-full p-2 border rounded mt-1"
          value={email}
          readOnly
        />
      </div>
    </div>
  );
};

export default ProfileSettings;
