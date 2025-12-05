// PaymentSuccess.tsx

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiFetch } from '../utils/apiClient'; // Your API utility
import { CheckCircle, XCircle, Clock } from 'lucide-react';

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
    const paystackReference = searchParams.get('reference');
    
    const [status, setStatus] = useState<'loading' | OrderStatusResponse['status']>('loading');
    const [orderData, setOrderData] = useState<OrderStatusData | null>(null);
    const [message, setMessage] = useState('Verifying payment status...');

    useEffect(() => {
        if (!paystackReference) {
            setStatus('failed');
            setMessage('Invalid URL. Missing payment reference.');
            return;
        }

        const fetchStatus = async () => {
            try {
                // Call the new backend endpoint
                const res = await apiFetch<OrderStatusResponse>(`/api/payments/status?ref=${paystackReference}`);
                
                setStatus(res.status);
                setMessage(res.message);
                if (res.data) {
                    setOrderData(res.data);
                }
            } catch (err) {
                console.error('Error fetching order status:', err);
                setStatus('failed');
                setMessage('Could not connect to the server to verify payment. Please check your email for confirmation.');
            }
        };

        fetchStatus();
    }, [paystackReference]);

    //  Content Rendering 
    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <>
                        <Clock size={48} className="text-blue-500 animate-spin mb-4" />
                        <h2 className="text-3xl font-bold text-gray-800">Verifying Payment...</h2>
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
            case 'pending':
                return (
                    <>
                        <Clock size={64} className="text-yellow-500 mb-4" />
                        <h2 className="text-4xl font-bold text-yellow-700">Payment Pending</h2>
                        <p className="text-xl text-gray-700 mt-2">{message}</p>
                        <p className="mt-4 text-md text-gray-600">If you do not receive your email within 10 minutes, please contact support with the reference below.</p>
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