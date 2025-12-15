// PaymentSuccess.tsx

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiFetch } from '../utils/apiClient'; // Your API utility
import { CheckCircle, XCircle, Loader } from 'lucide-react';

interface OrderStatusData {
    reference: string;
    quantity: number;
    amount: number;
    eventTitle: string;
    eventDate: string;
}

interface OrderStatusResponse {
    status: 'success' | 'pending' | 'failed' | 'not_found';
    message: string;
    data?: OrderStatusData;
}

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const paystackReference = searchParams.get('reference'); // Paystack passes 'reference'
    
    const [status, setStatus] = useState<'loading' | OrderStatusResponse['status']>('loading');
    const [orderData, setOrderData] = useState<OrderStatusData | null>(null);
    const [message, setMessage] = useState('Verifying payment status...');

            

 useEffect(() => {
                if (!paystackReference) {
                    setStatus('failed');
                    setMessage('Invalid URL. Missing payment reference.');
                    return;
                }

                const POLLING_INTERVAL = 4000; // 4 seconds
                let intervalId: NodeJS.Timeout | null = null;
                let attempts = 0;
                const maxAttempts = 20; 

               const fetchStatus = async () => {
            // Stop polling if max attempts reached or status is final
            if (attempts >= maxAttempts || status === 'success' || status === 'failed' || status === 'not_found') {
                if (intervalId) clearInterval(intervalId);
                if (attempts >= maxAttempts && status !== 'success') {
                    setStatus('failed');
                    setMessage('Taking longer than usual. Please check your email in 2 minutes.');
                }
                return;
            }

            attempts++;

            try {
                const res = await apiFetch<OrderStatusResponse>(
                    `/api/payments/status?ref=${paystackReference}`
                );

                //  Stop polling and update UI
                if (res.status === 'success') {
                    if (intervalId) clearInterval(intervalId); // Stop the loop
                    setStatus('success');
                    setMessage(res.message);
                    if (res.data) setOrderData(res.data);
                    return;
                }

             
                if (res.status === 'pending') {
                    setStatus('pending');
                    setMessage(res.message); // Use the message provided by the backend
                    return;
                }

                if (res.status === 'failed' || res.status === 'not_found') {
                    if (intervalId) clearInterval(intervalId); // Stop the loop
                    setStatus(res.status);
                    setMessage(res.message);
                    return;
                }
                
            } catch (err) {
                // Ignore API fetch errors during polling, let the loop continue until maxAttempts
                console.error("Polling API failed:", err);
                setMessage(`Connection error. Retrying... (Attempt ${attempts}/${maxAttempts})`);
            }
        };

        // Start the polling loop
        intervalId = setInterval(fetchStatus, POLLING_INTERVAL);
        fetchStatus(); // Initial call immediately

        // 2. Cleanup function to stop the interval when the component unmounts
        return () => {
            if (intervalId) clearInterval(intervalId);
        };

    }, [paystackReference]);

    //  Content Rendering 
    const renderContent = () => {
        switch (status) {
            case 'loading':
            case 'pending': // Handle both initial load and waiting states here
                return (
                    <>
                        <Loader size={48} className="text-yellow-500 animate-spin mb-4" />
                        <h2 className="text-3xl font-bold text-gray-800">
                            {status === 'loading' ? 'Verifying Payment...' : 'Processing Tickets...'}
                        </h2>
                        <p className="text-lg text-gray-600 mt-2">{message}</p>
                    </>
                  );
               
            case 'success':
                return (
                    <>
                        <CheckCircle size={64} className="text-green-500 mb-4" />
                        <h2 className="text-4xl font-bold text-green-700">Purchase Complete!</h2>
                        <p className="text-xl text-gray-700 mt-2">{message}</p>
                        {orderData && (
                            <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-400 text-left w-full max-w-sm">
                                <p><strong>Event:</strong> {orderData.eventTitle}</p>
                                <p><strong>Date:</strong> {new Date(orderData.eventDate).toLocaleDateString()}</p>
                                <p><strong>Quantity:</strong> {orderData.quantity}</p>
                                <p><strong>Amount Paid:</strong> GHS {orderData.amount.toFixed(2)}</p>
                                <p className="mt-2 text-sm text-green-600">Your PDF ticket(s) are attached to your email!</p>
                            </div>
                        )}
                    </>
                );
            
            case 'failed':
            case 'not_found':
            default:
                return (
                    <>
                        <XCircle size={64} className="text-red-500 mb-4" />
                        <h2 className="text-4xl font-bold text-red-700">Payment Failure/Error</h2>
                        <p className="text-xl text-gray-700 mt-2">{message}</p>
                        <p className="mt-4 text-md text-gray-600">If funds were deducted, please contact support immediately.</p>
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl text-center max-w-lg w-full">
                {renderContent()}
                
                {(status !== 'loading' && paystackReference) && (
                    <p className="text-sm text-gray-500 mt-6">
                        Transaction Reference: <strong>{paystackReference}</strong>
                    </p>
                )}
                
                <div className="mt-8 space-y-3">
                    <Link to="/" className="block py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                        Go to Home
                    </Link>
                    {status !== 'success' && (
                        <button onClick={() => window.location.reload()} className="block w-full py-3 px-6 text-blue-600 border border-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition">
                            Retry Verification
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}