// src/pages/EventDetails.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar, MapPin, Clock, ChevronRight, Share2, Heart } from "lucide-react";
import { apiFetch } from "../utils/apiClient";
import { useAuth } from "../Context/AuthContext";

interface TicketType {
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

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, ticketsRes] = await Promise.all([
          apiFetch(`/api/events/${id}`),
          apiFetch(`/api/events/${id}/tickets`)
        ]);
        setEvent(eventRes);
        setTickets(ticketsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleCheckout = () => {
    if (!selectedTicket || selectedTicket.remaining === 0) return;
    const path = isAuthenticated ? "/checkout" : "/guest-checkout";
    navigate(`${path}?ticketId=${selectedTicket._id}&quantity=${quantity}`);
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full"></div></div>;
  if (!event) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-2xl">Event not found</div>;

  const totalRemaining = tickets.reduce((sum, t) => sum + t.remaining, 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* HERO */}
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
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-12">
            {/* ABOUT */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border mt-[150px] border-white/10">
              <h2 className="text-3xl font-bold mb-6">About this event</h2>
              <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>

            {/* ORGANIZER */}
            {event.organizerId && (
              <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border mt-4 border-white/10">
                <h3 className="text-xl font-bold mb-4">Organized by</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-600 rounded-full flex items-center justify-center text-2xl font-black">
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

          {/* TICKET CARD — STICKY ON DESKTOP */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-3xl shadow-2xl p-8 text-gray-900">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black">Get Tickets</h3>
                {totalRemaining < 50 && totalRemaining > 0 && (
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    Only {totalRemaining} left!
                  </span>
                )}
              </div>

              <div className="space-y-4 mb-8">
                {tickets.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No tickets available yet</p>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                        selectedTicket?._id === ticket._id
                          ? "border-green-500 bg-green-50 shadow-lg scale-105"
                          : "border-gray-300 hover:border-gray-400"
                      } ${ticket.remaining === 0 ? "opacity-60" : ""}`}
                    >
                      {ticket.remaining === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-xl">
                            SOLD OUT
                          </span>
                        </div>
                      )}
                      <div className={`flex justify-between items-center ${ticket.remaining === 0 ? "blur-sm" : ""}`}>
                        <div>
                          <h4 className="font-black text-xl">{ticket.name}</h4>
                          <p className="text-3xl font-black text-green-600 mt-2">
                            GHS {ticket.price}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{ticket.remaining} left</p>
                          <ChevronRight className="w-8 h-8 text-green-600 ml-auto mt-2" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedTicket && selectedTicket.remaining > 0 && (
                <div className="border-t pt-6 space-y-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Quantity</span>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="bg-gray-100 px-4 py-2 rounded-lg font-black"
                    >
                      {[...Array(Math.min(selectedTicket.remaining, 10))].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-between text-xl font-black">
                    <span>Total</span>
                    <span>GHS {selectedTicket.price * quantity}</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-black text-xl py-5 rounded-2xl transition transform hover:scale-105 shadow-xl"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



