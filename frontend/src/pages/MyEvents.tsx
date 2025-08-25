import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  ticketsAvailable: number;
  image?: string;
}

const MyEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMyEvents = async () => {
        try {
          //const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
          const res = await apiFetch<Event[]>('/api/events/mine');
          //const data = await res.json();
          setEvents(res);
        } catch (err) {
          console.error('Error fetching events:', err);
        } finally {
          setLoading(false);
        }
      };
      
    fetchMyEvents();
  }, [navigate, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Events</h1>

      {events.length === 0 ? (
        <p className="text-gray-600">You haven’t created any events yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={event.image || '/placeholder.jpg'}
                alt={event.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-bold mb-2">{event.name}</h2>
                <h2 className="text-lg  mb-2">{event.description}</h2>
                <p className="text-gray-600 mb-2">{new Date(event.date).toLocaleDateString()}</p>
                <p className="text-gray-600 mb-2">{event.time}</p>
                <p className="text-gray-600 mb-4">{event.venue}</p>
                <p className=" mb-4 text-gray-500">
                <strong>Price:</strong> ${event.price.toFixed(2)}
                </p>
                <Link
                  to={`/edit-event/${event._id}`}
                  className="block bg-blue-600 text-white py-2 text-center rounded hover:bg-blue-700"
                >
                  Edit Event
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;
