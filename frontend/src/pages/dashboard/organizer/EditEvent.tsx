import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../../utils/apiClient";
import { toast } from "react-toastify";

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    category: "",
    price: 0,
    ticketsAvailable: 0,
    image: "",
  });

  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await apiFetch(`/api/events/${id}`);
        setForm(data);
      } catch (err) {
        console.error("Error loading event:", err);
      }
    };
    fetchEvent();
  }, [id]);

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit (PUT request to backend)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
    const token = localStorage.getItem('accessToken'); 
    if(!token){
        toast.error('Please login to edit event')
;
        return navigate('/login')
        
    }
    
      await apiFetch(`/api/events/edit-event/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });
    //   const result = await response.json()
    //   if(!response){
    //     throw new Error(result.message || 'Failed to edit en event')

    //   }

      toast.success('event edited successfully')
      navigate("/organizer/dashboard"); 
    } catch (err: any) {
  if (err.message === "Unauthorized") {
    toast.error("Session expired. Please login again.");
    navigate("/login");
    return;
  }
  toast.error("Failed to update event");
  console.error(err);
}
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Event name"
          className="w-full border p-2 rounded"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Event description"
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          name="date"
          value={form.date.split("T")[0] || ""}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="venue"
          value={form.venue}
          onChange={handleChange}
          placeholder="Venue"
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full border p-2 rounded"
        />
        
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      >
        <option value="">Select Category</option>
        <option value="Music">Music</option>
        <option value="Sports">Sports</option>
        <option value="Theatre">Theatre</option>
        <option value="Comedy">Comedy</option>
        <option value="Conference">Conference</option>
      </select>
        <input
          type="number"
          name="ticketsAvailable"
          value={form.ticketsAvailable}
          onChange={handleChange}
          placeholder="Tickets available"
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="image"
          value={form.image}
          onChange={handleChange}
          placeholder="Image URL"
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditEvent;
