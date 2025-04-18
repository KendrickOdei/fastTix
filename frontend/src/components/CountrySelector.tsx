
// components/OtpModal.tsx
import { useState } from 'react';

interface Props {
  email: string;
  serverOtp: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OtpModal({ email, serverOtp, onClose, onSuccess }: Props) {
  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    if (otp === serverOtp) {
      alert('✅ OTP Verified');
      onSuccess();
    } else {
      alert('❌ Incorrect OTP');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6 relative">
        <h2 className="text-xl font-bold text-center mb-4">Verify Your Email</h2>
        <p className="text-center text-gray-600 mb-6">Enter the OTP sent to <strong>{email}</strong></p>

        <input
          type="text"
          className="w-full border-2 border-gray-300 rounded-md p-3 text-center text-xl tracking-widest"
          placeholder="Enter OTP"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          onClick={handleVerify}
          className="w-full bg-green-600 text-white mt-6 py-3 rounded-lg text-lg hover:bg-green-700 transition"
        >
          Verify
        </button>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
}
