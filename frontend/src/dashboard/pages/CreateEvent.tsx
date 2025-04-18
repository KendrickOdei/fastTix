import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    price: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/events/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send token for authentication
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      alert("Event created successfully!");
      navigate("/"); // Redirect to homepage or events page
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-md p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Create Event</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="title" placeholder="Event Title" value={eventData.title} onChange={handleChange} className="w-full p-2 border rounded" required />
        <textarea name="description" placeholder="Event Description" value={eventData.description} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="date" name="date" value={eventData.date} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="text" name="location" placeholder="Event Location" value={eventData.location} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="number" name="price" placeholder="Ticket Price" value={eventData.price} onChange={handleChange} className="w-full p-2 border rounded" required />

        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600" disabled={loading}>
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
