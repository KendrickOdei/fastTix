import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  venue: string;
  image?: string;
}

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';
  
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${baseUrl}/api/search?q=${query}`);
        const data = await response.json();
        setResults(data.results);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]);


  

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500"></div>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-6">Search Results for: "{query}"</h1>
  
          {results?.length === 0 ? (
            <p className="text-gray-600">No events found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {results.map(event => (
                <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={event.image || '/placeholder.jpg'}
                    alt={event.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-lg font-bold mb-2">{event.name}</h2>
                    <p className="text-gray-600 mb-2">{new Date(event.date).toLocaleDateString()}</p>
                    <p className="text-gray-600 mb-2">{event.venue}</p>
                    <p className="text-gray-500 text-sm truncate">{event.description}</p>
  
                    <Link
                      to={`/event-details/${event._id}`}
                      className="block mt-4 text-center bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
  
};

export default SearchResults;
