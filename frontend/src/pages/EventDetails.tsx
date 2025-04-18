// frontend/src/pages/EventDetails.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/event/events/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (event?.promoImages && event.promoImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentPromoIndex((prev) => (prev + 1) % event.promoImages!.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [event]);

  if (isLoading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!event) return <p className="text-center mt-10">Event not found</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <button
          onClick={() => navigate('/')}
          className="text-green-600 hover:text-green-800 font-bold mb-4"
        >
          Back to Home
        </button>
        {event.image && (
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}
        <h1 className="text-3xl font-bold text-green-900 mb-4">{event.name}</h1>
        <p className="text-gray-600 mb-4">{event.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">
              <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Time:</strong> {event.time}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Venue:</strong> {event.venue}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Price:</strong> ${event.price.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Tickets Available:</strong> {event.ticketsAvailable}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Organizer:</strong> {event.organizerId.organizationName || 'Unknown'}
            </p>
          </div>
          <div className="relative">
            {event.promoImages && event.promoImages.length > 0 ? (
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img
                  src={event.promoImages[currentPromoIndex]}
                  alt={`Promo ${currentPromoIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() =>
                    setCurrentPromoIndex(
                      (prev) => (prev - 1 + event.promoImages!.length) % event.promoImages!.length
                    )
                  }
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-green-800 text-white p-2 rounded-full"
                >
                  ←
                </button>
                <button
                     onClick={() =>
                    setCurrentPromoIndex((prev) => (prev + 1) % event.promoImages!.length)
                }
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-800 text-white p-2 rounded-full"
                >
                →
                </button>

              </div>
            ) : (
              <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No Promo Images</span>
              </div>
            )}
          </div>
        </div>
        <Link
          to={`/event/${event._id}/purchase`}
          className="mt-6 inline-block bg-green-800 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Buy Tickets
        </Link>
      </div>
    </div>
  );
}