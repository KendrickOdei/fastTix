
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import OrganizerTermsModal from './OrganizerTermsModal'; 
import { useAuth } from '../../Context/AuthContext';


export default function CreateEvents() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  //  Control the visibility of the terms modal
  const { user, setAcceptedOrganizerTerms } = useAuth()
  const isAuthenticated = !!user

  // The component's hasAcceptedTerms state now directly reflects the context user
  const hasAcceptedTerms = user?.acceptedOrganizerTerms || false;
  const [showModal, setShowModal] = useState(true); 
  
  

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    price: '',
    ticketsAvailable: '',
    category: '',
    image: null as File | null,
    promoImages: [] as File[],
  });

  const [errors, setErrors] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    price: '',
    ticketsAvailable: '',
    category: '',
    image: '',
    promoImages: '',
  });
    
  // --- Modal Logic ---

 // 3. Check acceptance status when the user loads or changes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Handle non-authenticated user (e.g., redirect)
      toast.error('You must be logged in to create an event.');
      navigate('/login');
      return;
    }

    // Only organizers need to accept the terms
    if (user.role === 'organizer') {
        if (!user.acceptedOrganizerTerms) {
            setShowModal(true); // Show modal if organizer hasn't accepted
        } else {
            setShowModal(false); // Hide if already accepted
        }
    } else {
        // If it's a regular user trying to access the organizer page, redirect
        toast.error('You do not have permission to create events.');
        navigate('/');
    }
  }, [isAuthenticated, user, navigate])
  
//  handler to call API and update context
  const handleAcceptTerms = async () => {
    setIsLoading(true);
    try {

        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const token = localStorage.getItem('accessToken'); 
        
        await fetch(`${baseUrl}/api/events/accept-organizer-terms`, { 
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ acceptedOrganizerTerms: true }),
        });
        
        //  Update the local context state upon successful API response
        setAcceptedOrganizerTerms(true);

        setShowModal(false);
        toast.success('Terms accepted. You can now create your event!');
    } catch (error: any) {
        toast.error(error.message || 'Failed to save terms acceptance. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleDeclineTerms = () => {
    setShowModal(false);
    toast.error('Terms not accepted.');
    navigate('/organizer/dashboard'); 
  };

  //  Handlers for Form Fields 

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };
  

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

  // NEW HANDLER for multiple promo images
  const handlePromoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Convert FileList to Array and update state
      const fileArray = Array.from(files);
      setFormData((prev) => ({ ...prev, promoImages: fileArray }));
      setErrors((prev) => ({ ...prev, promoImages: '' }));
    }
  };


  const validateFields = () => {
    let hasError = false;
    const newErrors = { ...errors };

    //  Validation Logic 
    
    if (!formData.title.trim()) { newErrors.title = 'Event title is required'; hasError = true; }
    if (!formData.description.trim()) { newErrors.description = 'Description is required'; hasError = true; }
    if (!formData.date) { newErrors.date = 'Date is required'; hasError = true; } 
    else { const selectedDate = new Date(formData.date); if (selectedDate < new Date()) { newErrors.date = 'Date must be in the future'; hasError = true; }}
    if (!formData.time.trim()) { newErrors.time = 'Time is required'; hasError = true; }
    if (!formData.venue.trim()) { newErrors.venue = 'Venue is required'; hasError = true; }
    if(!formData.category.trim()){ newErrors.category ='Category is required'; hasError = true; }
    if (!formData.price.trim()) { newErrors.price = 'Price is required'; hasError = true; } 
    else if (Number(formData.price) < 0) { newErrors.price = 'Price must be non-negative'; hasError = true; }
    if (!formData.ticketsAvailable.trim()) { newErrors.ticketsAvailable = 'Tickets available is required'; hasError = true; } 
    else if (Number(formData.ticketsAvailable) <= 0) { newErrors.ticketsAvailable = 'Tickets available must be positive'; hasError = true; }
    


    setErrors(newErrors);
    return !hasError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    //  Prevent submission if terms are not accepted
  if (user?.role !== 'organizer' || !hasAcceptedTerms) {
        toast.error('You must be an approved organizer and accept the terms and conditions first.');
        setShowModal(true);
        setIsLoading(false);
        return;
    }

    if (!validateFields()) {
      setIsLoading(false);
      return;
    }

    // Submission Logic 
    try {
      const token = localStorage.getItem('accessToken'); 
      if (!token) {
        toast.error('No token found. Please login again');
        navigate('/login');
        return;
      }

      const form = new FormData();
          form.append('title', formData.title.trim());
          form.append('description', formData.description.trim());
          form.append('date', formData.date.trim());
          form.append('time', formData.time.trim());
          form.append('venue', formData.venue.trim());
          form.append('price', formData.price);
          form.append('category', formData.category);
          form.append('ticketsAvailable', formData.ticketsAvailable);

          if (formData.image) {
            form.append('image', formData.image);
          }

          formData.promoImages.forEach((file) => {
            form.append('promoImages', file); 
          });

          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

          const response = await fetch(`${baseUrl}/api/events/create-event`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`, 
            },
            body: form,
          });
                 
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || 'Failed to create event');
      }else{
        toast.success('Event created successfully');
      }

      navigate('/'); 
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 justify-center items-center "> 
      
      {/*  Organizer Terms Modal */}
      <OrganizerTermsModal
        isOpen={showModal}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />

      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-900">Create New Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
            <label className="block text-sm font-medium text-gray-700">Event Image (Main)</label>
            <input
              type="file"
              name="image"
              accept=".jpg,.jpeg,.png"
              onChange={handleImageChange}
              className={`w-full border rounded px-3 py-2 ${errors.image ? 'border-red-500' : ''}`}
            />
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
          </div>
          
          {/*  Promo Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Promo Images (Optional, Multiple)</label>
            <input
              type="file"
              name="promoImages"
              accept=".jpg,.jpeg,.png"
               multiple // Allows selection of multiple files
              onChange={handlePromoImageChange} 
              className={`w-full border rounded px-3 py-2 ${errors.promoImages ? 'border-red-500' : ''}`}
            />
             {formData.promoImages.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                    {formData.promoImages.length} file(s) selected.
                </p>
             )}
            {errors.promoImages && <p className="text-red-500 text-xs mt-1">{errors.promoImages}</p>}
          </div>
          
        
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Name</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${errors.title ? 'border-red-500' : ''}`}
              placeholder="e.g., Summer Rock Fest"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
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

          <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={formData.category}
            onChange={handleCategoryChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Select category</option>
            <option value="Music">Music</option>
            <option value="Sports">Sports</option>
            <option value="Theater">Theater</option>
            <option value="Comedy">Comedy</option>
            <option value="Conference">Conference</option>
          </select>
        </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate('/organizer/dashboard')}
              className="text-green-600 hover:text-green-800 font-bold"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading || !hasAcceptedTerms} // Disable if loading or terms aren't accepted
              className={`font-bold py-2 px-4 rounded flex items-center gap-2 ${
                isLoading || !hasAcceptedTerms ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-800 hover:bg-green-600'
              } text-white transition`}
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