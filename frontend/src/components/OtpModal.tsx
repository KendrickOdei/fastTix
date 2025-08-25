import { useState } from 'react';

type Props  = {
  type: 'email' ;
  address: string;
  onClose: () => void;
  onVerified: () => void;
};

 function OtpModal({ type, address, onClose, onVerified }: Props) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  
  

  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
          const res = await fetch(`${baseUrl}/api/sendotp/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: address}),
          });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
    } catch (err) {
      alert(`Failed to send the OTP to your ${type}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyOtp = async () => {
    setIsVerifying(true);
    try {
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
          const res = await fetch(`${baseUrl}/api/verifyotp/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: address, otp }),
          });

      const data = await res.json();
      if (res.ok) {
        onVerified();
        onClose();
      } else {
        alert(data.message || 'Verification failed');
      }
    } catch (err) {
      alert('Error verifying OTP');
    } finally {
      setIsVerifying(false);
    }
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-semibold mb-4">Verify your {type}</h2>
        <p className="text-sm text-gray-600 mb-4">{address}</p>

        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full border p-2 mb-3 rounded"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <div className="flex justify-between mb-3">
          <button
            onClick={handleSendOtp}
            disabled={isLoading}
            className="text-blue-600 hover:underline text-sm"
          >
            {isLoading ? 'Sending...' : 'Resend OTP'}
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 text-sm hover:underline"
          >
            Cancel
          </button>
        </div>

        <button
          onClick={handleVerifyOtp}
          disabled={isVerifying}
          className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded"
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </button>
      </div>
    </div>
  );
}

export default OtpModal;


