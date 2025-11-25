// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";

// interface Event {
//   _id: string;
//   name: string;
//   date: string;
//   image?: string;
//   ticketsSold: number;
//   ticketsRemaining: number;
// }



// const OverviewEventList = async () => {
//   const [events, setEvents] = useState<Event | null>(null)
//     try {
          
//           const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
//           const response = await fetch(`${baseUrl}/api/events/events`);
          
//           if(!response)throw new Error('Failed to fetch events')
//           const data = await response.json()
  
//           setEvents(data)
//         } catch (err: any) {
//           console.error('error fetching events', err)
//         } 
     
    
      
  
//     useEffect(() => {
//      OverviewEventList()
     
//     }, []);
  

//   return (
//     <div className="bg-white shadow-md rounded-2xl p-5">
//       <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>

//       {events.length === 0 && (
//         <p className="text-gray-500">No upcoming events yet.</p>
//       )}

//       <div className="space-y-4">
//         {events.map((event) => (
//           <Link
//             to={`/events/${event._id}`}
//             key={event._id}
//             className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition"
//           >
//             {/* image */}
//             <img
//               src={event.image || "/placeholder-event.jpg"}
//               className="w-16 h-16 object-cover rounded-lg"
//             />

//             {/* details */}
//             <div className="flex-1">
//               <h3 className="font-medium">{event.name}</h3>
//               <p className="text-sm text-gray-500">{new Date(event.date).toDateString()}</p>
//             </div>

//             {/* ticket info */}
//             <div className="text-right">
//               <p className="text-sm text-gray-600">
//                 Sold: {event.ticketsSold}
//               </p>
//               <p className="text-sm text-gray-600">
//                 Remaining: {event.ticketsRemaining}
//               </p>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }
// ;

// export default OverviewEventList;