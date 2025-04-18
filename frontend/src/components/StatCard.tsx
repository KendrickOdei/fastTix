// // components/EmailOtpForm.tsx
// import { useState } from 'react';

// export default function EmailOtpForm() {
//   const [email, setEmail] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [otp, setOtp] = useState('');
  

//   const handleSendOtp = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch('http://localhost:5000/api/otp/send-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email }),
//       });
  
//       const data = await response.json();
  
//       if (response.ok) {
//         setShowModal(true);
//       } else {
//         alert(data.message || 'Unknown error'); // Make sure data.message is being passed from backend
//       }
//     } catch (err) {
//       console.error('Error during OTP request:', err instanceof Error ? err.message : err);

//       alert('Error sending my OTP'); // Notify the user with a simple message
//     } finally {
//       setIsLoading(false);
//     }
//   };
  

//   const handleVerify = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/otp/verify-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, otp }),
//       });
  
//       const data = await response.json();
  
//       if (response.ok) {
//         alert('OTP verified ✅');
//         setShowModal(false);
//       } else {
//         alert(data.message || 'Verification failed ❌');
//       }
//     } catch (error) {
//       console.error('OTP verification failed:', error);
//       alert('Something went wrong.');
//     }
//   };
  

//   return (
//     <div className="p-4">
//       <h2 className="text-xl mb-2">Enter your email</h2>
//       <input
//         type="email"
//         className="border p-2 w-full"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         placeholder="your@email.com"
//       />
//       <button
//         onClick={handleSendOtp}
//         className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
//       >
//         Send OTP
//       </button>

//       {isLoading && (
//         <div className="mt-4 text-center">
//           <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-12 w-12 mx-auto animate-spin"></div>
//           <p>Sending OTP...</p>
//         </div>
//       )}

//       {showModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded shadow-md w-80">
//             <h3 className="text-lg font-semibold mb-2">Enter OTP</h3>
//             <input
//               type="text"
//               className="border p-2 w-full mb-4"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               placeholder="Enter 6-digit OTP"
//             />
//             <button
//               onClick={handleVerify}
//               className="bg-green-600 text-white px-4 py-2 rounded w-full"
//             >
//               Verify OTP
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
