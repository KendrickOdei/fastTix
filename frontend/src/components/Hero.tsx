import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  ticketsAvailable: number;
  organizerId: { organizationName: string };
  image?: string;
  promoImages?: string[];
}


const Hero = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/events/`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  
    return (
        <>
        <div className="relative w-full h-screen bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('/hero-bg.jpg')" }}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        {/* Content */}
        <div className="relative text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold">Experience the Best Events with FastTix</h1>
          <p className="mt-4 text-lg md:text-xl">Book tickets for concerts, sports, and more in seconds!</p>
          <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-lg transition">
            Browse Events
          </button>
        </div>
      </div>
      {/* events */}

      <main className="max-w-7xl mx-auto p-6">
        {isLoading && <p className="text-center">Loading events...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!isLoading && !error && events.length === 0 && (
          <p className="text-center">No events available. Check back soon!</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              {event.image ? (
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-48 object-cover rounded-t-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-t-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              <h2 className="text-xl font-bold text-green-900">{event.name}</h2>
              <p className="mt-2 text-gray-600">{event.description}</p>
              <p className="mt-2 text-sm text-gray-500">
                <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                <strong>Time:</strong> {event.time}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                <strong>Venue:</strong> {event.venue}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                <strong>Price:</strong> ${event.price.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                <strong>Tickets Available:</strong> {event.ticketsAvailable}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                <strong>Organizer:</strong> {event.organizerId.organizationName || 'Unknown'}
              </p>
              <Link
                to={`/event/${event._id}`}
                className="mt-4 inline-block bg-green-800 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </main>
      

        </>
      
    );
  };
  
  export default Hero;
  