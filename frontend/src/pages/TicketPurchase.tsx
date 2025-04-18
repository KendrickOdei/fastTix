import { useParams } from 'react-router-dom';
import { useState } from 'react';

type Event = {
  id: number;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  price: string;
  ticketsAvailable: number;
};

const TicketPurchase = () => {
  const { id } = useParams<{ id: string | undefined }>();
  const eventId = id ? parseInt(id) : undefined;

  // Define event data
  const eventData: { [key: number]: Event } = {
    1: {
      id: 1,
      name: "Rock Concert",
      description: "An exciting rock concert featuring top bands.",
      date: "2025-05-30",
      time: "7:00 PM",
      venue: "Stadium XYZ",
      price: "$50",
      ticketsAvailable: 100,
    },
    2: {
      id: 2,
      name: "Comedy Night",
      description: "A night full of laughs with the best comedians.",
      date: "2025-06-10",
      time: "8:00 PM",
      venue: "Comedy Club ABC",
      price: "$30",
      ticketsAvailable: 50,
    },
  };

  // Check if eventId is valid and fetch event details
  const validEventId = eventId === 1 || eventId === 2 ? eventId : undefined;
  const event = validEventId ? eventData[validEventId] : undefined;

  if (!event) {
    return <div>Event not found</div>;
  }

  const [ticketQuantity, setTicketQuantity] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  const handleTicketQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTicketQuantity(Number(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, we'll just show the confirmation message
    setFormSubmitted(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
      <p className="mb-2">{event.description}</p>
      <p className="mb-2"><strong>Date:</strong> {event.date}</p>
      <p className="mb-2"><strong>Time:</strong> {event.time}</p>
      <p className="mb-2"><strong>Venue:</strong> {event.venue}</p>
      <p className="mb-2"><strong>Price:</strong> {event.price}</p>
      <p className="mb-4"><strong>Tickets Available:</strong> {event.ticketsAvailable}</p>

      {formSubmitted ? (
        <div>
          <h2 className="text-xl font-bold mb-2">Ticket Purchase Confirmed</h2>
          <p>You have successfully purchased {ticketQuantity} tickets for the {event.name}!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="ticketQuantity" className="block text-lg mb-2">
              Tickets Quantity:
            </label>
            <input
              type="number"
              id="ticketQuantity"
              value={ticketQuantity}
              onChange={handleTicketQuantityChange}
              min="1"
              max={event.ticketsAvailable}
              className="border border-gray-300 rounded-md p-2 w-32"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="name" className="block text-lg mb-2">Your Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-lg mb-2">Your Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
              required
            />
          </div>

          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md">
            Proceed to Payment
          </button>
        </form>
      )}
    </div>
  );
};

export default TicketPurchase;
