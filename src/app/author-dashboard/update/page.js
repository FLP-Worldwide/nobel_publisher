"use client";
import React, { useState } from 'react';

export default function AuthorProfileUpdate() {
  // Simulating current author data
  const [author, setAuthor] = useState({
    name: 'John Doe',
    about: 'I am an author who writes about technology and personal growth.',
  });

  const [formData, setFormData] = useState({
    name: author.name,
    about: author.about,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate update logic
    setAuthor({ ...formData });
    alert('Profile updated!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Update Author Profile</h1>

        {/* Show current profile info */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Current Info</h2>
          <p><span className="font-medium">Name:</span> {author.name}</p>
          <p className="mt-1"><span className="font-medium">About:</span> {author.about}</p>
        </div>

        {/* Editable form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              New Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label htmlFor="about" className="block text-sm font-medium text-gray-700">
              New About/Bio
            </label>
            <textarea
              name="about"
              id="about"
              rows="4"
              value={formData.about}
              onChange={handleChange}
              placeholder="Tell something about yourself..."
              className="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
