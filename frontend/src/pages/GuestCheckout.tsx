import { useState,  } from 'react';
import {  useSearchParams } from 'react-router-dom';
import { apiFetch } from '../utils/apiClient'; 

// Define the shape of the data needed for the form
interface GuestData {
    name: string;
    email: string;
    phone: string;
}

// Define the shape of the successful API response
interface InitTransactionResponse {
    authorizationUrl: string;
    reference: string;
}

export default function GuestCheckout() {
    
    const [guestData, setGuestData] = useState<GuestData>({ name: '', email: '', phone: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    
    const [searchParams] = useSearchParams();


    
    // Ensure quantity is treated as a number, defaulting to 0 if invalid
    const ticketId = searchParams.get("ticketId");
    const quantity = searchParams.get("quantity");

    


    //  HANDLERS
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGuestData({ ...guestData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!guestData.name || !guestData.email || !guestData.phone) {
            return 'All fields are required.';
        }
        if (Number(quantity) <= 0 || !ticketId) {
            return 'Missing ticket information. Please return to the event page.';
        }
        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestData.email)) {
             return 'Please enter a valid email address.';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }
        
        setIsLoading(true);

        try {
            // Check for required data one last time before API call
            if (Number(quantity) <= 0 || !ticketId) {
                throw new Error("Cannot proceed: Missing required ticket data.");
            }

            
            const initData = await apiFetch<InitTransactionResponse>('/api/payments/initialize-transaction', {
                method: 'POST',
                
                body: JSON.stringify({
                    email: guestData.email,
                    ticketId: ticketId,
                    quantity: quantity,
                }),
            });
            
            //  REDIRECT TO PAYSTACK
            window.location.href = initData.authorizationUrl;

        } catch (err: any) {
            console.error('Payment initialization failed:', err);
            setError(err.message || 'Failed to initialize payment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Determine the button text and disability status
    const buttonText = Number(quantity) > 0 
        ? `Continue to Payment for ${Number(quantity)} Ticket${Number(quantity) > 1 ? 's' : ''}`
        : 'Missing Ticket Data - Cannot Proceed';
        
    const isButtonDisabled = isLoading || Number(quantity) <= 0 || !!error;

    
    return (
        // 💡  Dark background
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <form 
                onSubmit={handleSubmit} 
                
                className="bg-gray-800 p-8 md:p-12 rounded-none shadow-2xl text-center max-w-lg w-full border border-green-700"
            >
                <h1 className="text-4xl font-extrabold mb-2 text-green-400">Guest Checkout</h1>
                <p className="text-lg mb-8 text-gray-400">Please provide your details to secure your booking.</p>
                
                {error && (
                    <div className="bg-red-900 border border-red-500 text-red-300 px-4 py-3 rounded-none relative mb-6 text-sm" role="alert">
                        <span className="block sm:inline font-medium">{error}</span>
                    </div>
                )}
                
                <div className="space-y-4">
                    <input 
                        name="name"
                        placeholder="Full Name" 
                        value={guestData.name}
                        onChange={handleChange}
                        
                        className="border-gray-700 bg-gray-700 text-white p-3 rounded-none w-full focus:ring-green-500 focus:border-green-500 transition duration-150" 
                        disabled={isLoading}
                    />
                    <input 
                        name="email"
                        type="email"
                        placeholder="Email Address (Required for Tickets)" 
                        value={guestData.email}
                        onChange={handleChange}
                         
                        className="border-gray-700 bg-gray-700 text-white p-3 rounded-none w-full focus:ring-green-500 focus:border-green-500 transition duration-150" 
                        disabled={isLoading}
                    />
                    <input 
                        name="phone"
                        type="tel"
                        placeholder="Phone Number" 
                        value={guestData.phone}
                        onChange={handleChange}
                        className="border-gray-700 bg-gray-700 text-white p-3 rounded-none w-full focus:ring-green-500 focus:border-green-500 transition duration-150" 
                        disabled={isLoading}
                    />
                </div>
                
                <button 
                    type="submit"
                    className="mt-8 bg-green-600 text-white px-8 py-3 rounded-none text-lg font-bold hover:bg-green-500 transition duration-150 w-full disabled:opacity-50 disabled:cursor-not-allowed tracking-wider"
                    disabled={isButtonDisabled}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Initializing Payment...
                        </span>
                    ) : (
                        buttonText 
                    )}
                </button>

                <p className="mt-6 text-sm text-gray-500">
                    Already have an account? 
                    <button type="button" onClick={() => {/* navigate to login */}} className="text-green-500 hover:text-green-400 font-medium ml-1">
                        Log In
                    </button>
                </p>
            </form>
        </div>
    );
}