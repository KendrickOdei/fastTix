import {useEffect, useState} from "react";
import {useParams, Link} from "react-router-dom"
import { apiFetch } from "../../../utils/apiClient";
import Ticket from "../../../components/Ticket"


interface TicketResponse {
    success: boolean;
    message: string;
    count: number;
    data: TicketType[];
}


interface TicketType {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    sold: number;
    remaining: number;
    eventId: {
            _id: string;
            title: string;
            description: string;
            date: string;
            time: string;
            venue: string;
            price: number;
            ticketsAvailable: number;
            image?: string;
    }
}

export default function TicketsList() {
    const {eventId} = useParams()
    const [tickets, setTickets] = useState<TicketType[]>([])
    const [loading, setLoading] = useState(true)

    console.log(eventId)

    useEffect(() =>{
        const fetchTickets = async () => {

            try {
            const res = await apiFetch<TicketResponse>(`/api/events/${eventId}/tickets`)
            console.log("API RESPONSE:", res)
            setTickets(res.data)
        } catch (error) {
            console.error('Error fetching ticket types', error)
        }finally{
            setLoading(false)
        }
        }
        
        fetchTickets()
            
    },[eventId])

    if(loading) return <div className="p-10 text-center"> Loading tickets</div>
    if(tickets.length === 0) return (

        <div className="p-10 text-center ">
            <p className="text-xl mb-6">
                No ticket types created yet
            </p>
            <Link 
            to={`/organizer/create-ticket/${eventId}`}
            className="bg-green-600 text-white px-8 py-4 rounded-full font-bold"
            >
            Create your First Ticket
            </Link>
        </div>
    )

    
    
    //const event = tickets[0]?.eventId;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-6xl mx-auto px-4">
                <Link to="/organizer/my-events" className="text-green-600 hover:underline mb-6 inline-block">
                    Back to My Events
                </Link>

                {/* <h1 className="text-4xl font-bold text-center mb-4">{event.title}</h1> */}
                <p className="text-center text-gray-600 mb-10">All ticket types</p>

                <div className="grid md:grid-cols-2 gap-10">
                    {tickets.map((ticket)=>(
                        <div key={ticket._id} className="flex justify-center">
                            <Ticket
                             ticket ={ticket}
                             buyerName="Preview mode"
                            />
                        </div>
                    ))}

                </div>
                <div className="text-center mt-12">
                    <Link
                    to={`/organizer/create-ticket/${eventId}`}
                    className="bg-green-600 text-white px-4 rounded-full text-lg font-bold hover:b-green-700"
                    >
                     + Add more Ticket types
                    </Link>
                </div>
            </div>
        </div>
    )
}