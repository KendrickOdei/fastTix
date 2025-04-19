// frontend/src/pages/CreateEvent.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateEvents() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    price: '',
    ticketsAvailable: '',
    image: null as File | null,
    promoImages: [] as File[],
  
  });
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    price: '',
    ticketsAvailable: '',
    image: '',
    promoImages: '',
  
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setErrors((prev) => ({ ...prev, image: '' }));
    }
  };

  const handlePromoImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData((prev) => ({ ...prev, promoImages: Array.from(files).slice(0, 5) }));
      setErrors((prev) => ({ ...prev, promoImages: '' }));
    }
  };

  const validateFields = () => {
    let hasError = false;
    const newErrors = { ...errors };

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
      hasError = true;
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      hasError = true;
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
      hasError = true;
    } else {
      const selectedDate = new Date(formData.date);
      if (selectedDate < new Date()) {
        newErrors.date = 'Date must be in the future';
        hasError = true;
      }
    }
    if (!formData.time.trim()) {
      newErrors.time = 'Time is required';
      hasError = true;
    }
    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
      hasError = true;
    }
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
      hasError = true;
    } else if (Number(formData.price) < 0) {
      newErrors.price = 'Price must be non-negative';
      hasError = true;
    }
    if (!formData.ticketsAvailable.trim()) {
      newErrors.ticketsAvailable = 'Tickets available is required';
      hasError = true;
    } else if (Number(formData.ticketsAvailable) <= 0) {
      newErrors.ticketsAvailable = 'Tickets available must be positive';
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateFields()) {
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Assumes JWT from login
      if (!token) {
        alert('Please log in to create an event');
        navigate('/login');
        return;
      }

      const form = new FormData();
          form.append('name', formData.name);
          form.append('description', formData.description);
          form.append('date', formData.date);
          form.append('time', formData.time);
          form.append('venue', formData.venue);
          form.append('price', formData.price);
          form.append('ticketsAvailable', formData.ticketsAvailable);

          if (formData.image) {
            form.append('image', formData.image);
          }

          formData.promoImages.forEach((file) => {
            form.append('promoImages', file); // The key name must match what your backend expects
          });

          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/events`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`, // If your backend is protected
            },
            body: form,
          });
                 

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create event');
      }

      alert('Event created successfully!');
      navigate('/profile/my-events'); // Redirect to My Events (to be built)
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 justify-center items-center">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-900">Create New Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Event Image</label>
            <input
              type="file"
              name="image"
              accept=".jpg,.jpeg,.png"
              onChange={handleImageChange}
              className={`w-full border rounded px-3 py-2 ${errors.image ? 'border-red-500' : ''}`}
            />
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Promo Images (up to 5)</label>
            <input
              type="file"
              name="promoImages"
              accept=".jpg,.jpeg,.png"
              multiple
              onChange={handlePromoImagesChange}
              className={`w-full border rounded px-3 py-2 ${errors.promoImages ? 'border-red-500' : ''}`}
            />
            {errors.promoImages && <p className="text-red-500 text-xs mt-1">{errors.promoImages}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., Summer Rock Fest"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${errors.description ? 'border-red-500' : ''}`}
              placeholder="e.g., An exciting rock concert featuring top bands"
              rows={4}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${errors.date ? 'border-red-500' : ''}`}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <input
              type="text"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${errors.time ? 'border-red-500' : ''}`}
              placeholder="e.g., 7:00 PM"
            />
            {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Venue</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${errors.venue ? 'border-red-500' : ''}`}
              placeholder="e.g., Stadium XYZ"
            />
            {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${errors.price ? 'border-red-500' : ''}`}
              placeholder="e.g., 50"
              min="0"
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tickets Available</label>
            <input
              type="number"
              name="ticketsAvailable"
              value={formData.ticketsAvailable}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${errors.ticketsAvailable ? 'border-red-500' : ''}`}
              placeholder="e.g., 100"
              min="1"
            />
            {errors.ticketsAvailable && (
              <p className="text-red-500 text-xs mt-1">{errors.ticketsAvailable}</p>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="text-green-600 hover:text-green-800 font-bold"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-800 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              {isLoading && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {isLoading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}