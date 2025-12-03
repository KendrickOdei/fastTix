import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

// --- Interfaces (Kept the same) ---
interface Event {
    _id: string;
    title: string;
    date: string;
    venue: string;
    image?: string;
    category: string; // Ensure category is expected
}

interface paginatedData {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    results: Event[];
}

// --- Categories (Hardcoded list for the tabs) ---
const categories = [
    'All', 'Music', 'Sports', 'Arts & Theatre', 'Conferences', 'Comedy', 'Festival'
];

// --- Main Component ---
export default function EventsPage() {
    // --- States and Params ---
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const urlQuery = queryParams.get('q') || '';

    // Data States
    const [events, setEvents] = useState<Event[]>([]); // For general browse/pagination
    const [results, setResults] = useState<Event[]>([]); // For search query results (user's state name)
    const [isLoading, setIsLoading] = useState(false);
    
    // UI States
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState(urlQuery);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const limit = 9;
    
    // --- API Calls ---

    // Fetch Paginated Events (only when no search query is active)
    const fetchEvents = async (currentPage: number) => {
        if (urlQuery) return; 
        
        setIsLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const response = await fetch(`${baseUrl}/api/events/events?page=${currentPage}&limit=${limit}`);
    
            if (!response.ok) throw new Error('Failed to fetch events');
            const data: paginatedData = await response.json();
    
            setEvents(data.results);
            setPage(data.page);
            setTotalPages(data.totalPages);
    
        } catch (error: any) {
            console.error('Error fetching events', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch Search Results (only when query param changes)
    const fetchSearchResults = async () => {
        if (!urlQuery) {
            setResults([]); // Clear results if query is gone
            return;
        }

        setIsLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const response = await fetch(`${baseUrl}/api/events/events?q=${urlQuery}`); 
            const data = await response.json();
            
            setResults(data.results); 

        } catch (error) {
            console.error(error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };


    

    useEffect(() => {
        // Reset category and search term whenever the URL query changes
        setActiveCategory('All'); 
        setSearchTerm(urlQuery);

        if (urlQuery) {
            fetchSearchResults();
        } else {
            // Only fetch paginated events when there is no search query
            fetchEvents(page);
        }

    }, [urlQuery, page]); // Dependency includes 'page' for pagination and 'urlQuery' for search mode


    
    // Handle form submission for the search bar on this page
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim() && searchTerm.trim() !== urlQuery) {
            // Only navigate if the search term is new
            navigate(`/events?q=${encodeURIComponent(searchTerm)}`);
        } else if (!searchTerm.trim()) {
            // Clear search if input is empty
            navigate('/events');
        }
    };

    // Reset all filters and search state
    const handleClearFilters = () => {
        setSearchTerm('');
        setActiveCategory('All');
        navigate('/events'); // Clears the 'q' parameter from the URL
    };
    
    // Determine which array of events to use (search results or general  events)
    const baseEvents = urlQuery ? results : events;
    
    // Client-side category filtering
    const displayedEvents = baseEvents.filter(event => {
        if (activeCategory === 'All') return true;
        // Check for null/undefined category safely
        return event.category?.toLowerCase() === activeCategory.toLowerCase();
    });

    
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-6 py-2">

                {/* 2. Search Bar (Now fully controlled by state and logic) */}
                <form onSubmit={handleSearchSubmit} className="mb-8 max-w-2xl mx-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by event title, venue, or keyword..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-4 pl-12 pr-4 text-lg border-2 border-green-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 transition-shadow shadow-lg"
                        />
                        <button type="submit" className="absolute left-0 top-0 h-full w-12 flex items-center justify-center">
                            <Search className="w-6 h-6 text-green-500" />
                        </button>
                    </div>
                </form>



                    {/*  Category Tabs */}
                <div className="mb-12 overflow-x-auto scrollbar-hide"> 
                    <div className="flex justify-start gap-4 py-2 flex-nowrap mx-auto max-w-7xl px-4 sm:px-6 md:justify-center md:flex-wrap">
                        {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`
                            px-6 py-2 rounded-full text-lg font-semibold transition-all duration-200 whitespace-nowrap
                            ${activeCategory === category
                                ? 'bg-green-600 text-white shadow-md transform scale-105'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-green-100 hover:border-green-400'
                            }
                            `}
                        >
                            {category}
                        </button>
                        ))}
                    </div>
                </div>

                {/* 4. Event Results (Fixed logic to use displayedEvents) */}
                <div className="mt-12">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Skeleton Loading State */}
                            {[...Array(limit)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl shadow-lg animate-pulse">
                                    <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                                    <div className="p-6 space-y-4">
                                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : displayedEvents.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* FIX: Map over displayedEvents instead of the raw events array */}
                                {displayedEvents.map((event) => (
                                    <EventCard key={event._id} event={event} />
                                ))}
                            </div>
                            
                            {/* Pagination (Only show if not in search mode) */}
                            {!urlQuery && (
                                <div className='flex justify-center items-center space-x-4 mt-10'>
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className='px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition'
                                    >
                                        Previous
                                    </button>
                                    <span className='text-lg font-semibold'>
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className='px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition'
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl shadow-lg">
                            <p className="text-2xl text-gray-600 font-medium mb-4">
                                No events found.
                            </p>
                            <p className="text-lg text-gray-500">
                                Try adjusting your search query or category filter.
                            </p>
                            <button 
                                onClick={handleClearFilters}
                                className="mt-6 text-green-600 hover:text-green-800 font-semibold flex items-center justify-center mx-auto"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Event Card Component (Kept the same) ---
interface EventCardProps {
    event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => (
    <Link
        to={`/event-details/${event._id}`}
        className="group bg-white rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 block"
    >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
            <img
                src={event.image || '/fallback-event-image.jpg'} 
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            {/* Category Tag */}
            <span className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {event.category || 'General'}
            </span>
        </div>

        {/* Content */}
        <div className="p-6">
            <h3 className="text-xl font-black text-gray-900 line-clamp-2 group-hover:text-green-600 transition mb-3">
                {event.title}
            </h3>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5 text-green-500 shrink-0" />
                    <span className='font-medium'>{format(new Date(event.date), "EEE, MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                    <span className="truncate">{event.venue}</span>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <span className="text-green-600 font-extrabold text-lg">
                    View Details
                </span>
                <ArrowRight className="w-6 h-6 text-green-600 group-hover:translate-x-1 transition" />
            </div>
        </div>
    </Link>
);