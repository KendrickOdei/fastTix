
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MapPin, ArrowRight,  } from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  date: string;
  venue: string;
  image?: string;
  category?: string;
}

interface paginatedData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  results: Event[]
}

export default function Hero() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1)
  


   const limit = 10
   const fetchEvents = async (page: number) => {

    setIsLoading(true)
      
      try {
        
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${baseUrl}/api/events/events?page=${page}&limit=${limit}`);
        
        if(!response)throw new Error('Failed to fetch events')
        const data: paginatedData = await response.json()

        
  
        setEvents(data.results);
        setPage(data.page)
        
      } catch (err: any) {
        ;
      } finally {
        setIsLoading(false);
      }
    };
  
    

  useEffect(() => {
    console.log('fetching events', page)
   fetchEvents(page);
  }, [page]);
  
 

  useEffect(() => {
    // Fetch only upcoming + featured events
    
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/events/events`)
      .then(r => r.json())
      .then(data => {
        setFeaturedEvents(data.results || []);
        setIsLoading(false);
      });
  }, []);

  // Auto-rotate carousel every 6 seconds
  useEffect(() => {
    if (featuredEvents.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % featuredEvents.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [featuredEvents.length]);

  const currentEvent = featuredEvents[currentSlide];

  return (
    <>
      {/* FULL-SCREEN CAROUSEL HERO */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Image + Dark Overlay */}
        <div className="absolute inset-0">
          {isLoading ? (
            <div className="w-full h-full bg-gradient-to-br from-green-900 via-black to-red-900" />
          ) : (
            <img
              src={currentEvent?.image || '/hero-fallback.jpg'}
              alt={currentEvent?.title}
              className="w-full h-full object-cover transition-all duration-1000"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center justify-between max-w-7xl mx-auto px-6">
          {/* Left: Text + CTA */}
          <div className="max-w-2xl text-white">
            {/* <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
              <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-bold">
                Ghana's #1 Event Platform
              </span>
            </div> */}

            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              {currentEvent ? currentEvent.title : "Discover Amazing Events"}
            </h1>

            {currentEvent && (
              <div className="space-y-4 mb-8">
                <div className="flex text-center items-center gap-4 text-xl">
                  <div className="flex text-center items-center gap-2 text-2xl font-bold">
                      <MapPin className="w-5 h-5 text-red-500" />
                        <span >{currentEvent.venue}</span>
                    </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <Link
                to={currentEvent ? `/event-details/${currentEvent._id}` : "/events"}
                className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-black text-xl px-10 py-5 rounded-full shadow-2xl flex items-center gap-3 transition transform hover:scale-105"
              >
                Get Tickets Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition" />
              </Link>

              <Link
                to="/events"
                className="bg-white/10 backdrop-blur border-2 border-white/30 hover:bg-white/20 text-white font-bold text-xl px-10 py-5 rounded-full transition"
              >
                Browse All Events
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-8 mt-12 text-sm">
              <span>100% Secure Payments</span>
              <span>Instant Tickets</span>
              <span>Mobile Money & Card</span>
              
            </div>
          </div>

          {/* Right: Carousel Indicators */}
          {featuredEvents.length > 1 && (
            <div className="hidden lg:flex flex-col gap-3">
              {featuredEvents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-12 rounded-full transition-all ${
                    index === currentSlide
                      ? "bg-white w-4"
                      : "bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

      
      </section>

                  {/* events */}
                <section className="bg-white py-20">
                  <div className="max-w-7xl mx-auto px-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-10">
                      <div>
                        <h2 className="text-4xl md:text-5xl font-black text-black mb-2">
                          Upcoming Events
                        </h2>
                        <p className="text-gray-800 text-lg">Swipe or scroll to explore</p>
                      </div>
                      <Link
                        to="/events"
                        className="hidden md:flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-full transition transform hover:scale-105 shadow-xl"
                      >
                        View All Events
                        <ArrowRight className="w-6 h-6" />
                      </Link>
                    </div>

                    {/* Horizontal Scroll Container */}
                    <div className="overflow-x-auto scrollbar-hide">
                      <div className="flex gap-6 pb-6">
                        {isLoading ? (
                          // Skeleton Loading
                          [...Array(6)].map((_, i) => (
                            <div key={i} className="min-w-[320px] bg-gray-900 rounded-2xl overflow-hidden animate-pulse">
                              <div className="h-48 bg-gray-800" />
                              <div className="p-6 space-y-3">
                                <div className="h-6 bg-gray-800 rounded w-3/4" />
                                <div className="h-4 bg-gray-800 rounded w-1/2" />
                              </div>
                            </div>
                          ))
                        ) : events.length === 0 ? (
                          <div className="text-center text-gray-500 py-20 w-full">
                            <p className="text-2xl">No events yet. Be the first to create one!</p>
                          </div>
                        ) : (
                          events.map((event) => (
                            <Link
                              key={event._id}
                              to={`/event-details/${event._id}`}
                              className="group min-w-[320px] bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                            >
                              {/* Image */}
                              <div className="relative h-48 overflow-hidden">
                                {event.image ? (
                                  <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center">
                                    <span className="text-white text-4xl font-black">{event.title[0]}</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition" />
                              </div>

                              {/* Content */}
                              <div className="p-6 bg-white">
                                <h3 className="text-xl font-black text-gray-900 line-clamp-2 group-hover:text-green-600 transition">
                                  {event.title}
                                </h3>

                                <div className="mt-4 space-y-2 text-sm">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-5 h-5 text-green-500" />
                                    <span>{format(new Date(event.date), "EEE, MMM d")}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-5 h-5 text-red-500" />
                                    <span className="truncate">{event.venue}</span>
                                  </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                  <span className="text-green-600 font-black text-lg">Get Tickets</span>
                                  <ArrowRight className="w-6 h-6 text-green-600 group-hover:translate-x-2 transition" />
                                </div>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Mobile "View All" Button */}
                    <div className="md:hidden mt-10 text-center">
                      <Link
                        to="/events"
                        className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-5 rounded-full text-xl transition transform hover:scale-105 shadow-2xl"
                      >
                        View All Events
                        <ArrowRight className="w-6 h-6" />
                      </Link>
                    </div>
                  </div>
                </section>

                {/* Hide scrollbar but keep functionality */}
                {/* <style jsx>{`
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                `}</style> */}






    

    </>
  );
}
