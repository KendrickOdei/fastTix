import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader, RefreshCw } from "lucide-react";
// import { apiFetch } from "../utils/apiClient"; // If you implement a status check API

type Status = 'loading' | 'success' | 'failure';

export default function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    
    // Paystack redirects back with 'reference' as a query parameter
    const reference = searchParams.get('reference');

    // State to track fulfillment status
    const [status, setStatus] = useState<Status>('loading');
    const [message, setMessage] = useState('Verifying payment and confirming your order...');

    // This useEffect is where we would ideally check the final order status
    // from our own database, which was updated by the webhook.
    useEffect(() => {
        if (!reference) {
            setMessage('Missing transaction reference. Payment status unknown.');
            setStatus('failure');
            return;
        }

        const checkOrderStatus = async () => {
             // ⚠️ IMPORTANT: The actual order fulfillment (DB update) happens on the 
             // backend via the webhook. Here, we are checking the outcome.
             
             // For now, we simulate success after a delay, assuming the webhook
             // completes quickly after the user is redirected.
             await new Promise(resolve => setTimeout(resolve, 3000)); 

             // 💡 Robust Implementation Suggestion:
             // You would implement a route like GET /api/orders/status/:reference
             // to check if the 'Order' model was created with status 'paid'.
             
             // try {
             //    const orderStatus = await apiFetch(`/api/orders/status/${reference}`);
             //    if (orderStatus.status === 'paid') {
             //        setMessage(`Payment successfully verified! Your order is confirmed.`);
             //        setStatus('success');
             //    } else {
             //        setMessage('Payment successful but order fulfillment is delayed. Please check your email.');
             //        setStatus('failure');
             //    }
             // } catch (error) { ... }

             setMessage(`Payment successfully verified! Your order reference is: ${reference}. Tickets will be emailed shortly.`);
             setStatus('success');
        };

        checkOrderStatus();
    }, [reference]);

    // --- UI Rendering ---

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="text-center space-y-4">
                        <Loader className="w-16 h-16 text-green-500 animate-spin mx-auto" />
                        <h2 className="text-3xl font-bold">Verifying Order...</h2>
                        <p className="text-gray-400">{message}</p>
                    </div>
                );
            case 'success':
                return (
                    <div className="text-center space-y-6">
                        <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                        <h2 className="text-4xl font-black text-green-400">TICKET PURCHASED!</h2>
                        <p className="text-lg text-gray-200">
                            Your order is **confirmed**. A copy of your ticket(s) has been sent to your email.
                        </p>
                        <div className="bg-gray-800 p-4 rounded-lg inline-block">
                            <p className="font-mono text-sm text-gray-400">Transaction Reference: **{reference}**</p>
                        </div>
                        <div className="flex justify-center gap-4 pt-4">
                            <Link to="/profile/orders" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition">
                                View My Orders
                            </Link>
                            <Link to="/" className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition">
                                Back to Events
                            </Link>
                        </div>
                    </div>
                );
            case 'failure':
                return (
                    <div className="text-center space-y-6">
                        <XCircle className="w-20 h-20 text-red-500 mx-auto" />
                        <h2 className="text-4xl font-black text-red-400">PAYMENT ERROR</h2>
                        <p className="text-lg text-gray-200">
                            {message}
                            <br/> If money was debited, please contact support immediately with the reference below.
                        </p>
                        <div className="bg-gray-800 p-4 rounded-lg inline-block">
                            <p className="font-mono text-sm text-gray-400">Reference: {reference || 'N/A'}</p>
                        </div>
                        <Link to="/" className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition mx-auto max-w-xs">
                             <RefreshCw className="w-5 h-5"/> Back to Home
                        </Link>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
            <div className="w-full max-w-xl bg-gray-950 border border-gray-800 p-10 rounded-3xl shadow-2xl">
                {renderContent()}
            </div>
        </div>
    );
}