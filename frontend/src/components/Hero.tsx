import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'; 
import HomeFeatures from './HomeFeatures';
import HomePartnerPitch from './HomePartnerPitch';
import { useAuth } from '../Context/AuthContext';

// Interfaces 
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
  const {user,} = useAuth();
   const isAuthenticated = !!user
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1);
  
  const eventsContainerRef = useRef<HTMLDivElement>(null);
  // state to track if the scroll is at the start 
  const [isAtStart, setIsAtStart] = useState(true);

  
  


   const limit = 10
   const fetchEvents = async (page: number) => {

    setIsLoading(true)
      
      try {
        
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${baseUrl}/api/events/events?page=${page}&limit=${limit}`);
        
        if(!response.ok) throw new Error('Failed to fetch events')
        const data: paginatedData = await response.json()

        
  
        setEvents(data.results);
        setPage(data.page)
        
      } catch (err: any) {
        // Log or handle error
        console.error("Error fetching paginated events:", err);
      } finally {
        setIsLoading(false);
      }
    };
  
 useEffect(() => {
   fetchEvents(page);
  }, [page]);
    
  // Scroll Functionality
  const scrollEvents = (direction: 'left' | 'right') => {
    if (eventsContainerRef.current) {
      const scrollAmount = 350; // Scroll roughly one event card width
      
      if (direction === 'left') {
        eventsContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        eventsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Function to check scroll position and update state
  const handleScroll = () => {
    if (eventsContainerRef.current) {
      setIsAtStart(eventsContainerRef.current.scrollLeft === 0);
    }
  };


 
  
  // Attach and detach scroll listener
  useEffect(() => {
    const currentRef = eventsContainerRef.current;
    if (currentRef) {
      // Initial check on load
      handleScroll();
      currentRef.addEventListener('scroll', handleScroll);
      return () => currentRef.removeEventListener('scroll', handleScroll);
    }
  }, [events.length]); // Re-run when events load or change

 

  useEffect(() => {
    // Fetch only upcoming + featured events
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/events/events`)
      .then(r => r.json())
      .then(data => {
        setFeaturedEvents(data.results || []);
      })
      .catch(err => {
        console.error("Error fetching featured events:", err);
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
        <div className="relative h-full flex items-center max-w-7xl mx-auto px-6">
          {/* Left: Text + CTA  */}
          <div className="max-w-3xl text-white md:mx-auto md:text-center"> 

            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              {currentEvent ? currentEvent.title : "Discover Amazing Events"}
            </h1>

            {currentEvent && (
              <div className="space-y-4 mb-8">
                <div className="flex text-center items-center gap-4 text-xl md:justify-center">
                  <div className="flex text-center items-center gap-2 text-2xl font-bold">
                      <MapPin className="w-5 h-5 text-red-500" />
                        <span >{currentEvent.venue}</span>
                    </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 md:justify-center"> {/* Centering buttons */}
              <Link
                to={currentEvent ? `/event-details/${currentEvent._id}` : "/events"}
                className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-black text-xl px-8 py-4 rounded-lg shadow-2xl flex items-center gap-3 transition transform hover:scale-105"
              >
                Get Tickets Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition" />
              </Link>

              <Link
                to="/events"
                className="bg-white/10 backdrop-blur border-2 border-white/30 hover:bg-white/20 text-white font-bold text-xl px-8 py-4 rounded-lg transition"
              >
                Browse All Events
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-8 mt-12 text-sm md:justify-center"> {/* Centering badges */}
              <span>100% Secure Payments</span>
              <span>Instant Tickets</span>
              <span>Mobile Money & Card</span>
              
            </div>
          </div>

        </div>

        {/* Carousel Indicators */}
        {featuredEvents.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 p-4 z-10">
            {featuredEvents.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-10 h-2 rounded-lg transition-all duration-300 cursor-pointer ${
                  index === currentSlide
                    ? "bg-white w-12" 
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </section>

                  {/* events */}
                <section className="bg-white py-12">
                  <div className="max-w-7xl mx-auto px-6">
                    {/* Header  */}
                    <div className="mb-10 text-center">
                      <div>
                        
                        <p className="text-gray-900 text-4xl font-bold">Swipe to explore upcoming events.</p>
                      </div>
                    </div>

                    {/* Horizontal Scroll Container with Desktop Nav */}
                    <div className="relative">
                      {/* Scrollable Content */}
                     
                      <div className="overflow-x-auto scrollbar-hide" ref={eventsContainerRef}> 
                        <div className="flex gap-6 pb-6 w-max min-w-full md:w-auto md:mx-auto">
                          {isLoading ? (
                            // Skeleton Loading
                            [...Array(6)].map((_, i) => (
                              <div key={i} className="min-w-[320px] bg-gray-100 rounded-2xl overflow-hidden animate-pulse shadow-md">
                                <div className="h-48 bg-gray-200" />
                                <div className="p-6 space-y-3">
                                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                                  <div className="h-4 bg-gray-200 rounded w-1/2" />
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

                      {/* Hide Left Button if at the start (isAtStart) */}
                      <button
                        onClick={() => scrollEvents('left')}
                        className={`hidden lg:flex absolute left-0 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 items-center justify-center bg-white/80 hover:bg-white border border-gray-200 rounded-full shadow-lg transition-all ${
                            isAtStart && events.length < 4 ? 'opacity-0 pointer-events-none' : '' // Hide if at start AND not many events
                        }`}
                        style={{visibility: (isAtStart && events.length < 4) ? 'hidden' : 'visible'}} 
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                      </button>

                      {/* Right Button  */}
                      <button
                        onClick={() => scrollEvents('right')}
                        className={`hidden lg:flex absolute right-0 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 items-center justify-center bg-white/80 hover:bg-white border border-gray-200 rounded-full shadow-lg transition-all ${
                            events.length < 4 ? 'opacity-0 pointer-events-none' : ''
                        }`}
                        style={{visibility: events.length < 4 ? 'hidden' : 'visible'}}
                      >
                        <ChevronRight className="w-6 h-6 text-gray-700" />
                      </button>
                    </div>

                    {/* "View All" Button */}
                    <div className="mt-10 text-center">
                      <Link
                        to="/events"
                        className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-5 rounded-lg text-xl transition transform hover:scale-105 shadow-2xl"
                      >
                        View All Events
                        <ArrowRight className="w-6 h-6" />
                      </Link>
                    </div>
                  </div>
                </section>

     <section className="bg-gray-900 text-white py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 text-center">
        
        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Your Ticket to Unforgettable Experiences.
        </h1>
        
        {/* Engaging Sub-Headline */}
        <p className="text-xl md:text-2xl text-green-200 mb-10 max-w-4xl mx-auto">
          From concerts to conferences, find and book the best events happening right now.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/events"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8  text-lg transition duration-300 rounded-xl shadow-xl transform hover:scale-105"
           >
            Find Your Next Adventure
          </Link>
          <Link
             to= {isAuthenticated ? "/organizer/dashboard" : "/register"}
            className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white font-bold py-4 px-8 rounded-xl text-lg transition duration-300"
          >
            Got an Event? Host with Us!
          </Link>
        </div>

      </div>
     </section>
     {/* Home features sections */}

     <section>
        <HomeFeatures/>
     </section>

     <section>
        <HomePartnerPitch/>
     </section>
    
    </>
  );
}