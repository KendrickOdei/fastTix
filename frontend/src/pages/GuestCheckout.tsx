
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiFetch } from "../utils/apiClient";
import { useAuth } from "../Context/AuthContext";
import { Loader2 } from "lucide-react";

// Define the structure for the transaction payload
interface TransactionPayload {
    tickets: {
        ticketId: string;
        quantity: number;
        price: number;
    }[];
    email: string;
    name: string;
}

export default function GuestCheckout() {
    
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [orderTotalQuantity, setOrderTotalQuantity] = useState<number>(0);
    const [orderSubtotal, setOrderSubtotal] = useState<number>(0);
    
    //  Retrieve user AND loading state from AuthContext
    const { user, loading: loadingAuth } = useAuth(); // Renamed to loadingAuth to avoid conflict
    
    // State for local form data, pre-filled from AuthContext user
    const [formData, setFormData] = useState({
        name: user?.fullName || '', 
        email: user?.email || '',  
    });
    
    // State to track only the Paystack initiation process
    const [loadingPayment, setLoadingPayment] = useState(false);
    
    const isAuthenticated = !!user;
    
    let eventId = searchParams.get("eventId")
    
    
    // Fallback to session storage if URL params are missing
    if (!eventId) {
        eventId = sessionStorage.getItem('checkout_eventId');
    }

    //  HANDLE TICKET DATA AND ORDER SUMMARY 
    useEffect(() => {
        if (loadingAuth) return; // Wait for auth status
        
        const rawItems = sessionStorage.getItem('checkout_selectedTickets');
        
        if (!eventId) {
            toast.error("Event information missing. Returning home.");
            navigate('/');
            return;
        }

        if (rawItems) {
            try {
                const items = JSON.parse(rawItems);
                let totalQty = 0;
                let sub = 0;
                
                // Calculate summary from the full items list
                items.forEach((item: any) => {
                    totalQty += item.quantity;
                    sub += item.quantity * item.ticket.price;
                });
                
                setOrderItems(items);
                setOrderTotalQuantity(totalQty);
                setOrderSubtotal(sub);
                
                // Save eventId to session storage for resilience
                sessionStorage.setItem('checkout_eventId', eventId!);

            } catch (e) {
                console.error("Error parsing checkout tickets:", e);
                toast.error("Error loading ticket details.");
                navigate(`/event-details/${eventId}`);
            }
        } else if (!rawItems) {
            // If no tickets are found in storage, redirect to event details to re-select.
            toast.error("No tickets selected. Please select tickets.");
            navigate(`/event-details/${eventId}`);
        }
        
    }, [loadingAuth, navigate, eventId]); // Added dependencies for clarity and correctness

    useEffect(() => {
        if (loadingAuth) return;

        const currentPath = window.location.pathname;
        const requiredQuery = `?eventId=${eventId || ''}`; 

        // Only enforce routing if we have eventId and ticket data is loaded
        if (eventId && orderTotalQuantity > 0) {
            
            // Logged-in user on the wrong path? Redirect to /checkout.
            if (isAuthenticated && currentPath !== '/checkout') {
                navigate(`/checkout${requiredQuery}`);
                return; 
            } 
            
            // Guest user on the wrong path? Redirect to /guest-checkout.
            if (!isAuthenticated && currentPath !== '/guest-checkout') {
                navigate(`/guest-checkout${requiredQuery}`);
                return;
            }
        }
        
        // Update form data when auth state changes (e.g., user logs in)
        if (isAuthenticated && (formData.email !== user!.email || formData.name !== user!.fullName)) {
            setFormData({
                name: user!.fullName || '',
                email: user!.email || '', 
            });
        }
        
        // If not authenticated, ensure form fields can be edited
        if (!isAuthenticated && user === null) {
            setFormData(prev => ({ ...prev, email: prev.email || '', name: prev.name || '' }));
        }

    }, [eventId, navigate, isAuthenticated, user, loadingAuth, orderTotalQuantity]);


    // --- 3. HANDLER FOR FORM INPUTS ---
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    
    const initiatePaystackPayment = async (e: React.FormEvent) => {
        e.preventDefault(); // Stop default form submission

        // Basic form validation
        if (!formData.name || !formData.email || orderTotalQuantity === 0) {
            toast.error("Please fill in your name and email.");
            return;
        }

        const payload: TransactionPayload = {
            email: formData.email,
            name: formData.name,
            tickets: orderItems.map(item => ({
                ticketId: item.ticket._id,
                quantity: item.quantity,
                price: item.ticket.price 
            })),
        };
        
        setLoadingPayment(true);
        try {
            
            const transactionRes = await apiFetch<{ authorizationUrl: string, reference: string }>('/api/payments/initialize-transaction', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            window.location.href = transactionRes.authorizationUrl;

        } catch (error: any) {
            console.error("Payment initiation failed:", error);
            toast.error(error.message || "Failed to initiate payment. Please try again.");
            if (eventId) {
                navigate(`/event-details/${eventId}`); 
            } else {
                navigate('/');
            }

        } finally {
            setLoadingPayment(false);
        }
    };
    
    
    
    
    // Show a general loading spinner while AuthContext is fetching user data
    if (loadingAuth || (orderTotalQuantity === 0 && !loadingPayment)) { 
        //  show loading if Auth is busy OR if tickets haven't loaded yet.
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                 <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
                 <p className="ml-4 text-lg">Preparing Checkout...</p>
             </div>
        );
    }
    
    // payment processing screen
    if (loadingPayment) {
        return (
            <div className="min-h-screen flex items-center justify-center text-sky-950">
                <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-2xl">
                    <Loader2 className="h-12 w-12 text-green-500 animate-spin mb-4" />
                    <h2 className="text-xl font-bold">Redirecting to Paystack...</h2>
                    <p className="text-sky-950 mt-2">Do not close this window.</p>
                </div>
            </div>
        );
    }
    
    
    //  RENDER THE FORM 
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <form onSubmit={initiatePaystackPayment} className="w-full max-w-lg bg-sky-950 rounded-xl shadow-2xl p-8 space-y-6">
                <h2 className="text-3xl font-black text-white mb-8">Confirm Your Purchase</h2>
                
                {/*  Displays the accurate breakdown */}
                <div className="border p-4 rounded-lg bg-gray-50">
                    <h3 className="font-bold text-sky-950 mb-2">Order Details</h3>
                    
                    {/* Display itemized list */}
                    {orderItems.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm text-sky-950">
                            {/* Assuming item.ticket.name is available */}
                            <span>{item.ticket.name} (x{item.quantity})</span> 
                            <span>GHS {(item.quantity * item.ticket.price).toFixed(2)}</span>
                        </div>
                    ))}

                    <div className="border-t pt-2 mt-2">
                        {/* The total quantity now accurately reflects the summary */}
                        <p className="font-medium text-sky-950">Total Tickets: {orderTotalQuantity}</p>
                        
                        <p className="text-xl font-black text-green-600 mt-2">
                            Total Payable: GHS {orderSubtotal.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white mb-2">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border bg-white text-sky-950 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 "
                        placeholder="Your full name"
                    />
                </div>

                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg  focus:border-green-500 bg-white text-sky-950"
                        placeholder="your@email.com"
                        disabled={isAuthenticated}
                    />
                     {isAuthenticated && <p className="mt-1 text-xs text-white">Email cannot be changed while logged in.</p>}
                </div>
                
                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loadingPayment || orderTotalQuantity === 0} // Disable if no tickets
                    className={`w-full text-white font-black text-xl py-4 rounded-lg transition shadow-lg ${
                        loadingPayment || orderTotalQuantity === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:scale-[1.01]"
                    }`}
                >
                    {loadingPayment ? "Processing..." : "Proceed To Grab Ticket"}
                </button>
            </form>
        </div>
    );
}