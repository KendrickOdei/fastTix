
import { Link } from "react-router-dom";
const events = [
  { id: 1, name: "Rock Concert", date: "April 10, 2025", time: "7:00 PM", location: "Madison Square Garden", seats: 50 },
  { id: 2, name: "Comedy Night", date: "April 15, 2025", time: "8:00 PM", location: "Downtown Theater", seats: 30 },
  { id: 3, name: "Tech Conference", date: "April 20, 2025", time: "9:00 AM", location: "Convention Center", seats: 100 },
];

const FeaturedEvents = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
    {events.map((event) => (
      <div key={event.id} className="border p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-2">{event.name}</h2>
        <Link to={`/event/${event.id}`} className="text-blue-600">View Details</Link>
      </div>
    ))}
  </div>
  );
};

export default FeaturedEvents;
