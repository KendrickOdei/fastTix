import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Define the Event interface based on the API response and usage
interface Event {
  _id: string;         // Assuming _id is a string (common in APIs like MongoDB)
  title: string;
  description: string;
  date: string;        // Use string if the API returns a date string, or Date if parsed
}

const Dashboard = () => {
  // Type the events state as an array of Event
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Fetch events created by the logged-in user (seller)
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/events/my-events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch events");
        }
        const data: Event[] = await res.json(); // Type the response data
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
      <Link className="bg-blue-600 text-white p-2 rounded" to='/create-event'>Create New Event</Link>
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Your Events</h2>
        <ul>
          {events.map((event) => (
            <li key={event._id} className="border p-4 my-2">
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <p>{event.description}</p>
              <span>{event.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;