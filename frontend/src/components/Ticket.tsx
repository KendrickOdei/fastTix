// src/components/tickets/Ticket.tsx
import QRCode from 'react-qr-code'
import { format } from "date-fns";


interface EventType {
    _id: string;
    title: string;
    date: string;
    venue: string;
    image?: string;
}

interface TicketProps {
  ticket: {
    _id: string;
    name: string;
    price: number;
    type?: string;
    eventId: string | EventType
  };
  buyerName: string;
  buyerEmail?: string;
}

export default function Ticket({ ticket, buyerName }: TicketProps) {
 

  const event = typeof ticket.eventId === "string"
  ? {title: "Loading...", venue: "", date: "", image: ""}
  : ticket.eventId

  // // QR Code contains ticket ID + secret (you'll generate this on backend later)
  const qrData = `https://fasttix.com/verify/${ticket._id}`;

  const getTierColor = () => {
    if (ticket.name.toLowerCase().includes("vip")) return "from-yellow-500 to-orange-600";
    if (ticket.name.toLowerCase().includes("early")) return "from-purple-600 to-pink-600";
    if (ticket.price === 0) return "from-green-500 to-emerald-600";
    return "from-blue-600 to-cyan-600";
  };

  return (
    <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden font-sans border border-gray-200">
      {/* Event Hero Image */}
      <div 
        className="h-40 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${event.image || "/default-event.jpg"})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            {event.title}
          </h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Ticket Tier Badge */}
        <div className={`inline-block px-6 py-3 rounded-full bg-gradient-to-r ${getTierColor()} text-white font-bold shadow-lg`}>
          {ticket.name.toUpperCase()} • {ticket.price === 0 ? "FREE" : `GHS ${ticket.price}`}
        </div>

        {/* Buyer Info */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-sm text-gray-600">Ticket Holder</p>
          <p className="text-xl font-bold text-gray-900">{buyerName}</p>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Date & Time</p>
            <p className="font-bold text-lg">
              {format(new Date(event.date), "EEE, MMM d • h:mm a")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Venue</p>
            <p className="font-bold text-lg">{event.venue}</p>
          </div>
        </div>

        {/* QR CODE — THE STAR */}
        <div className="flex justify-center py-8">
          <div className="bg-white p-6 rounded-3xl shadow-inner border-4 border-dashed border-gray-300">
            <QRCode value={qrData} size={220} level="H" />
          </div>
        </div>

        {/* Ticket ID */}
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Ticket ID
          </p>
          <p className="font-mono text-lg font-bold text-gray-800">
            {ticket._id.slice(-12).toUpperCase()}
          </p>
        </div>

        {/* Ghana Power */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Powered by{" "}
            <span className="font-bold text-green-600 text-lg">fastTix</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Made with love in Ghana
          </p>
        </div>
      </div>
    </div>
  );
}