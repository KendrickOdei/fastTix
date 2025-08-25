import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

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

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  
  const isAuthenticated = !!localStorage.getItem('token'); 

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const res = await fetch(`${baseUrl}/api/events/${id}`);
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate(`/checkout?eventId=${event?._id}&quantity=${quantity}`);
    } else {
      navigate(`/guest-checkout?eventId=${event?._id}&quantity=${quantity}`);
    }
  };

  if (loading) return <div className="text-center mt-10 text-xl">Loading...</div>;

  if (!event) return <div className="text-center mt-10 text-xl">Event not found.</div>;

  return (
    <>
    
    
    <div className="relative w-full h-96 bg-cover bg-center" style={{ backgroundImage: `url(${event.image || '/placeholder.jpg'})` }}>
      <div className="absolute inset-0  bg-opacity-50 flex flex-col items-center justify-center text-center text-white px-4">
    <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
    <p className="text-lg mb-1">{new Date(event.date).toLocaleDateString()} at {event.time}</p>
    <p className="text-md">{event.venue}</p>
    </div>
    </div>

    <div className="max-w-5xl mx-auto px-4 mt-12">
      {/* <img
        src={event.image || '/placeholder.jpg'}
        alt={event.name}
        className="w-full h-96 object-cover rounded-lg shadow-md mb-6"
      /> */}
      
      <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
      <p className="text-gray-600 mb-2">{new Date(event.date).toLocaleDateString()} at {event.time}</p>
      <p className="text-gray-700 mb-2">{event.venue}</p>
      <p className="text-gray-700 mb-6">{event.description}</p>
      
      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        <p className="text-xl font-semibold mb-2">${event.price.toFixed(2)} per ticket</p>
        <p className="text-gray-600 mb-4">{event.ticketsAvailable} tickets left</p>

        <div className="flex items-center space-x-4 mb-4">
          <input
            type="number"
            value={quantity}
            min={1}
            max={event.ticketsAvailable}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none"
          />
          <button
            onClick={handleCheckout}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default EventDetails;
