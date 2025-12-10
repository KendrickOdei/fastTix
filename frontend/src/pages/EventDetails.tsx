import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react"; 
import { format } from "date-fns";
import { Calendar, MapPin, Clock,  Share2, Heart, Plus, Minus } from "lucide-react"; 
import { useAuth } from "../Context/AuthContext";

export interface TicketType {
  _id: string;
  name: string;
  price: number;
  quantity: number; 
  sold: number;
  remaining: number;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  image?: string;
  organizerId: { organizationName: string }
}

interface SelectedTicketMap {
  [ticketId: string]: number; 
}


export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  
  //  Tracks quantity selected for each ticket ID
  const [selectedTickets, setSelectedTickets] = useState<SelectedTicketMap>({});
  
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, ticketsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/events/${id}`),
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/events/${id}/tickets`)
        ]);
        const eventResData = await eventRes.json()
        setEvent(eventResData);
        const ticketsResData = await ticketsRes.json()
        setTickets(ticketsResData.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  
  // Calculated values for Order Summary and Checkout Button
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
 
  // handlers for Plus/Minus Buttons
  const handleQuantityChange = (ticketId: string, delta: 1 | -1, maxRemaining: number) => {
    setSelectedTickets(prev => {
      const currentQty = prev[ticketId] || 0;
      const newQty = currentQty + delta;
      
      if (newQty < 0) return prev; // Cannot go below zero
      if (newQty > maxRemaining) return prev; // Cannot exceed remaining tickets

      const newMap = { ...prev };
      if (newQty === 0) {
        delete newMap[ticketId]; 
      } else {
        newMap[ticketId] = newQty;
      }
      return newMap;
    });
  };

  const handleCheckout = () => {
    // Check if any tickets are selected
    if (summary.totalQuantity === 0) return; 

   
    const firstSelected = summary.items[0];
    
    if (!firstSelected) return;

    const path = isAuthenticated ? "/checkout" : "/guest-checkout";

   
    sessionStorage.setItem('checkout_selectedTickets', JSON.stringify(summary.items));
    sessionStorage.setItem('checkout_eventId', id!);
    
    
    navigate(`${path}?eventId=${id}`)

  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full"></div></div>;
  if (!event) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-2xl">Event not found</div>;

  const totalRemaining = tickets.reduce((sum, t) => sum + t.remaining, 0);


  return (
    <div className="min-h-screen bg-white text-white">
      {/* Hero section  */}
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

            <div className="flex items-center gap-6 mt-26">
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
        <div className="grid lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT  */}
          <div className="lg:col-span-2 space-y-12 ]">
            {/* ABOUT */}
            <div className="bg-sky-950 backdrop-blur-lg rounded-sm p-8 border mt-[150px] border-white/10">
              <h2 className="text-3xl font-bold mb-6">About this event</h2>
              <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>

            {/* ORGANIZER */}
            {event.organizerId && (
              <div className="bg-sky-950 backdrop-blur-lg rounded-sm p-8 border mt-4 border-white/10">
                <h3 className="text-xl font-bold mb-4">Organized by</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16  rounded-full flex bg-white text-black items-center justify-center text-2xl font-bold">
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

          {/*  CHECKOUT LOGIC HERE */}
          <div className="lg:col-span-1 ">
               <div className="lg:sticky  lg:top-8 h-fit ">
            <div className="bg-sky-950 rounded-sm shadow-2xl p-8 ">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Get Tickets</h3>
                {totalRemaining < 50 && totalRemaining > 0 && (
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    Only {totalRemaining} left!
                  </span>
                )}
              </div>

              {/* TICKET TYPE SELECTION */}
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
                    />
                  ))
                )}
              </div>
              
              {/* ORDER SUMMARY & CHECKOUT */}
              <OrderSummary 
                summary={summary} 
                handleCheckout={handleCheckout} 
                eventTitle={event.title} 
              />
            </div>
          </div>
          </div>

        </div>
      </div>
    </div>
  );
}



// Ticket Selector with Plus/Minus
interface TicketSelectorProps {
  ticket: TicketType;
  selectedQuantity: number;
  onQuantityChange: (ticketId: string, delta: 1 | -1, maxRemaining: number) => void;
}

const TicketSelector: React.FC<TicketSelectorProps> = ({ ticket, selectedQuantity, onQuantityChange }) => {
  const isSoldOut = ticket.remaining === 0;
  const isSelected = selectedQuantity > 0;
  
  return (
    <div
      className={`border-2 rounded-sm p-4 transition-all ${
        isSoldOut
          ? "border-red-200 bg-gray-100 opacity-60"
          : isSelected 
          ? "border-green-500 bg-sky-950 shadow-lg"
          : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="pr-4">
          <h4 className={`text-white font-bold text-xl ${isSoldOut ? 'text-red-500' : 'text-gray-900'}`}>
            {ticket.name}
          </h4>
          <p className="text-2xl font-bold text-white  mt-1">
            GHS {ticket.price}
          </p>
          <p className="text-xs text-gray-500 mt-1">{ticket.remaining} available</p>
        </div>

        {/* Quantity Picker */}
        <div className="flex items-center space-x-2">
          {isSoldOut ? (
            <span className="text-red-600 font-bold text-lg">SOLD OUT</span>
          ) : (
            <>
              <button
                onClick={() => onQuantityChange(ticket._id, -1, ticket.remaining)}
                disabled={selectedQuantity === 0}
                className="p-2 border border-gray-300 rounded-full text-white hover:bg-gray-100 disabled:opacity-50 transition"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-2xl font-bold text-white w-8 text-center">{selectedQuantity}</span>
              <button
                onClick={() => onQuantityChange(ticket._id, 1, ticket.remaining)}
                disabled={selectedQuantity >= ticket.remaining}
                className="p-2 border border-green-500 rounded-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


//  Order Summary and Checkout Button
interface SummaryProps {
  summary: {
    totalQuantity: number;
    subtotal: number;
    items: { ticket: TicketType; quantity: number }[];
  };
  handleCheckout: () => void;
  eventTitle: string;
}

const OrderSummary: React.FC<SummaryProps> = ({ summary, handleCheckout,  }) => {
  const isCheckoutDisabled = summary.totalQuantity === 0;

  return (
    <div className="border-t pt-6 space-y-6">
      {isCheckoutDisabled ? (
        <p className="text-center text-white font-medium py-4">Select tickets above to proceed.</p>
      ) : (
        <>
          <h4 className="text-xl font-bold text-white">Order Summary</h4>
          
          {/* Detailed Items */}
          {summary.items.map(item => (
            <div key={item.ticket._id} className="text-sm">
              <div className="flex justify-between font-medium">
                <span className="text-white">
                  Qty {item.quantity} x {item.ticket.name.toUpperCase()}
                </span>
                <span className="text-white">Gh₵ {item.quantity * item.ticket.price}.00</span>
              </div>
            </div>
          ))}

          {/* Subtotal */}
          <div className="flex justify-between text-white text-lg font-bold border-t pt-4 mt-4">
            <span>Subtotal</span>
            <span >Gh₵ {summary.subtotal.toFixed(2)}</span>
          </div>
        </>
      )}

      {/* disabled when Qty is 0 */}
      <button
        onClick={handleCheckout}
        disabled={isCheckoutDisabled}
        className={`w-full font-black text-xl py-5 rounded-2xl transition transform shadow-xl ${
          isCheckoutDisabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:scale-[1.02]"
        }`}
      >
        {isCheckoutDisabled ? "Select Tickets to Proceed" : "Proceed to Checkout"}
      </button>
    </div>
  );
};