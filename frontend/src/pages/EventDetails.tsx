import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { Calendar, MapPin, Clock, Share2, Heart, Plus, Minus } from "lucide-react";
import { useAuth } from "../Context/AuthContext";

export interface TicketType {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  remaining: number;
}

interface EventData {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  image?: string;
  organizerId: { organizationName: string };
}

interface SelectedTicketMap {
  [ticketId: string]: number;
}

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [event, setEvent] = useState<EventData | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<SelectedTicketMap>({});
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, ticketsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/events/${id}`),
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/events/${id}/tickets`)
        ]);
        const eventResData = await eventRes.json();
        setEvent(eventResData);
        const ticketsResData = await ticketsRes.json();
        setTickets(ticketsResData.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  //  Calculate if the event date has already passed
  const isEventPast = useMemo(() => {
    if (!event) return false;
    const eventDate = new Date(event.date);
    const now = new Date();
    // Use setHours(0,0,0,0) on both if you want to allow buying on the day of the event
    return eventDate < now;
  }, [event]);

  // Calculated values for Order Summary
  const summary = useMemo(() => {
    let totalQuantity = 0;
    let subtotal = 0;
    const items: { ticket: TicketType; quantity: number }[] = [];

    for (const ticketId in selectedTickets) {
      const quantity = selectedTickets[ticketId];
      if (quantity > 0) {
        const ticket = tickets.find(t => t._id === ticketId);
        if (ticket) {
          totalQuantity += quantity;
          subtotal += quantity * ticket.price;
          items.push({ ticket, quantity });
        }
      }
    }
    return { totalQuantity, subtotal, items };
  }, [selectedTickets, tickets]);

  const handleQuantityChange = (ticketId: string, delta: 1 | -1, maxRemaining: number) => {
    if (isEventPast) return; // Block changes if event is past

    setSelectedTickets(prev => {
      const currentQty = prev[ticketId] || 0;
      const newQty = currentQty + delta;
      if (newQty < 0 || newQty > maxRemaining) return prev;

      const newMap = { ...prev };
      if (newQty === 0) delete newMap[ticketId];
      else newMap[ticketId] = newQty;
      return newMap;
    });
  };

  const handleCheckout = () => {
    if (summary.totalQuantity === 0 || isEventPast) return;
    const path = isAuthenticated ? "/checkout" : "/guest-checkout";
    sessionStorage.setItem('checkout_selectedTickets', JSON.stringify(summary.items));
    sessionStorage.setItem('checkout_eventId', id!);
    navigate(`${path}?eventId=${id}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-2xl">
      Event not found
    </div>
  );

  const totalRemaining = tickets.reduce((sum, t) => sum + t.remaining, 0);

  return (
    <div className="min-h-screen bg-white text-white">
      {/* Hero section */}
      <div className="relative h-screen max-h-[600px]">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${event.image || "/hero-placeholder.jpg"})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
        </div>

        <div className="relative h-full flex flex-col justify-end pb-12 px-6 max-w-7xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black leading-tight">{event.title}</h1>
            <div className="flex flex-wrap gap-6 text-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-green-400" />
                <span>{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-red-400" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-red-400" />
                <span>{event.venue}</span>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-10">
              <button onClick={() => setLiked(!liked)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur px-6 py-3 rounded-full transition">
                <Heart className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                <span>{liked ? "Saved" : "Save Event"}</span>
              </button>
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur px-6 py-3 rounded-full transition">
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
          
      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8 pb-20">
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-sky-950 backdrop-blur-lg rounded-sm p-8 border mt-[150px] border-white/10">
              <h2 className="text-3xl font-bold mb-6">About this event</h2>
              <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>

            {event.organizerId && (
              <div className="bg-sky-950 backdrop-blur-lg rounded-sm p-8 border border-white/10">
                <h3 className="text-xl font-bold mb-4">Organized by</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex bg-white text-black items-center justify-center text-2xl font-bold">
                    {event.organizerId.organizationName[0]}
                  </div>
                  <div>
                    <p className="text-xl font-bold">{event.organizerId.organizationName}</p>
                    <p className="text-gray-400">Verified Organizer</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="bg-sky-950 rounded-sm shadow-2xl p-8 border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Get Tickets</h3>
                  {!isEventPast && totalRemaining < 50 && totalRemaining > 0 && (
                    <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                      Only {totalRemaining} left!
                    </span>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  {tickets.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No tickets available yet</p>
                  ) : (
                    tickets.map((ticket) => (
                      <TicketSelector
                        key={ticket._id}
                        ticket={ticket}
                        selectedQuantity={selectedTickets[ticket._id] || 0}
                        onQuantityChange={handleQuantityChange}
                        isEventPast={isEventPast}
                      />
                    ))
                  )}
                </div>
                
                <OrderSummary 
                  summary={summary} 
                  handleCheckout={handleCheckout} 
                  isEventPast={isEventPast} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ticket Selector Component
interface TicketSelectorProps {
  ticket: TicketType;
  selectedQuantity: number;
  onQuantityChange: (ticketId: string, delta: 1 | -1, maxRemaining: number) => void;
  isEventPast: boolean;
}

const TicketSelector: React.FC<TicketSelectorProps> = ({ ticket, selectedQuantity, onQuantityChange, isEventPast }) => {
  const isSoldOut = ticket.remaining === 0;
  const isSelected = selectedQuantity > 0;
  const isDisabled = isSoldOut || isEventPast;
  
  return (
    <div
      className={`border-2 rounded-sm p-4 transition-all ${
        isDisabled
          ? "border-white/10 bg-white/5 opacity-60"
          : isSelected 
          ? "border-green-500 bg-sky-900/50 shadow-lg"
          : "border-white/20 hover:border-white/40"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="pr-4">
          <h4 className={`font-bold text-xl ${isDisabled ? 'text-gray-500' : 'text-white'}`}>
            {ticket.name}
          </h4>
          <p className="text-2xl font-bold text-white mt-1">GHS {ticket.price.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{ticket.remaining} available</p>
        </div>

        <div className="flex items-center space-x-2">
          {isEventPast ? (
            <span className="text-red-400 font-bold text-sm uppercase border border-red-400/30 px-3 py-1 rounded">Ended</span>
          ) : isSoldOut ? (
            <span className="text-red-500 font-bold text-sm uppercase">Sold Out</span>
          ) : (
            <>
              <button
                onClick={() => onQuantityChange(ticket._id, -1, ticket.remaining)}
                disabled={selectedQuantity === 0}
                className="p-2 border border-white/30 rounded-full text-white hover:bg-white/10 disabled:opacity-30 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-bold text-white w-6 text-center">{selectedQuantity}</span>
              <button
                onClick={() => onQuantityChange(ticket._id, 1, ticket.remaining)}
                disabled={selectedQuantity >= ticket.remaining}
                className="p-2 border border-green-500 rounded-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Order Summary Component
interface SummaryProps {
  summary: {
    totalQuantity: number;
    subtotal: number;
    items: { ticket: TicketType; quantity: number }[];
  };
  handleCheckout: () => void;
  isEventPast: boolean; 
}

const OrderSummary: React.FC<SummaryProps> = ({ summary, handleCheckout, isEventPast }) => {
  const isCheckoutDisabled = summary.totalQuantity === 0 || isEventPast;

  return (
    <div className="border-t border-white/10 pt-6 space-y-6">
      {isEventPast ? (
         <p className="text-center text-red-400 font-medium py-2 bg-red-400/10 rounded">
            Ticket sales have ended for this event.
         </p>
      ) : summary.totalQuantity === 0 ? (
        <p className="text-center text-gray-400 font-medium py-4">Select tickets above to proceed.</p>
      ) : (
        <>
          <h4 className="text-xl font-bold text-white">Order Summary</h4>
          {summary.items.map(item => (
            <div key={item.ticket._id} className="text-sm">
              <div className="flex justify-between font-medium">
                <span className="text-gray-300">
                  {item.quantity} x {item.ticket.name.toUpperCase()}
                </span>
                <span className="text-white">GHS {(item.quantity * item.ticket.price).toFixed(2)}</span>
              </div>
            </div>
          ))}
          <div className="flex justify-between text-white text-lg font-bold border-t border-white/10 pt-4 mt-4">
            <span>Subtotal</span>
            <span>GHS {summary.subtotal.toFixed(2)}</span>
          </div>
        </>
      )}

      <button
        onClick={handleCheckout}
        disabled={isCheckoutDisabled}
        className={`w-full font-black text-xl py-5 rounded-xl transition transform shadow-xl ${
          isCheckoutDisabled
            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:scale-[1.02]"
        }`}
      >
        {isEventPast 
            ? "Event has Ended" 
            : summary.totalQuantity === 0 
              ? "Select Tickets" 
              : "Proceed to Checkout"
        }
      </button>
    </div>
  );
};