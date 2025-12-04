// CheckoutPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiFetch } from "../utils/apiClient";
import { useAuth } from "../Context/AuthContext"; // Import useAuth to get user email

export default function CheckoutPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user,  } = useAuth(); // Get user data/email
    const isAuthenticated = !!user

    // 1. Read parameters from the URL (already correctly done in your EventDetails)
    const ticketId = searchParams.get("ticketId");
    const quantity = searchParams.get("quantity");

    const [loading, setLoading] = useState(false);
    
    // Fallback for email if user is logged in
    const userEmail = user?.email; 

    useEffect(() => {
        // NOTE: For guest checkout, you must collect email before this point.
        if (!ticketId || !quantity) {
            toast.error("Missing ticket or quantity information.");
            navigate('/');
            return;
        }

        // 2. Check for email if user is authenticated
        if (!userEmail && isAuthenticated) {
             toast.error("User email missing. Cannot initialize payment.");
             navigate('/eventDetails'); // Redirect to profile to fill in missing info
             return;
        }
        
        
         if (!userEmail && !isAuthenticated) { navigate('/guest-checkout'); return; }

        const initiatePaystackPayment = async () => {
            setLoading(true);
            try {
                // 3. Call your custom backend endpoint to initialize the Paystack transaction
                const transactionRes = await apiFetch<{ authorizationUrl: string, reference: string }>('/api/payments/initialize-transaction', {
                    method: 'POST',
                    body: JSON.stringify({
                        ticketId,
                        quantity: Number(quantity),
                        email: userEmail, 
                    }),
                });

                // Redirect the user to the Paystack authorization URL
                window.location.href = transactionRes.authorizationUrl;
                
            } catch (error: any) {
                console.error("Payment initiation failed:", error);
                toast.error(error.message || "Failed to initiate payment. Please try again.");
                navigate(`/event-details`); 
            } finally {
                setLoading(false);
            }
        };

        // We only initiate if we have the necessary data (email, ticketId, quantity)
        if (userEmail || !isAuthenticated) { 
             initiatePaystackPayment();
        }
    }, [ticketId, quantity, navigate, userEmail, isAuthenticated]);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
            <div className="flex flex-col items-center p-8 bg-gray-800 rounded-xl shadow-2xl">
                <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mb-4"></div>
                {loading && (
                  <div>
                    <h2 className="text-xl font-bold">Redirecting to Paystack...</h2>
                    <p className="text-gray-400 mt-2">Do not close this window.</p>
                  </div>
                  
                )}
                
            </div>
        </div>
    );
}