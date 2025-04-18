// import { useState } from "react";

// type OtpModalProps = {
//   type: "email" | "phone";
//   onClose: () => void;
//   onSuccess: () => void;
// };

// export default function OtpModal({ type, onClose, onSuccess }: OtpModalProps) {
//   const [value, setValue] = useState("");
//   const [otp, setOtp] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSendOtp = async () => {
//     setIsLoading(true);
//     try {
//       const res = await fetch(`http://localhost:5000/api/sendotp/send-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ [type]: value }),
//       });
//       await res.json();
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleVerifyOtp = async () => {
//     try {
//       const res = await fetch(`http://localhost:5000/api/verifyotp/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ [type]: value, otp }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         onSuccess();
//       } else {
//         alert(data.message || "Verification failed");
//       }
//     } catch (err) {
//       alert("Something went wrong.");
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-md shadow-md w-96 space-y-4">
//         <h3 className="text-lg font-semibold">
//           Verify your {type === "email" ? "Email" : "Phone"}
//         </h3>

//         <input
//           type={type === "email" ? "email" : "tel"}
//           value={value}
//           onChange={(e) => setValue(e.target.value)}
//           placeholder={type === "email" ? "you@example.com" : "Enter phone"}
//           className="border p-2 w-full"
//         />

//         <button
//           onClick={handleSendOtp}
//           className="bg-blue-600 text-white px-4 py-2 rounded w-full"
//         >
//           {isLoading ? "Sending OTP..." : "Send OTP"}
//         </button>

//         <input
//           type="text"
//           value={otp}
//           onChange={(e) => setOtp(e.target.value)}
//           placeholder="Enter OTP"
//           className="border p-2 w-full"
//         />

//         <button
//           onClick={handleVerifyOtp}
//           className="bg-green-600 text-white px-4 py-2 rounded w-full"
//         >
//           Verify
//         </button>

//         <button onClick={onClose} className="text-sm text-gray-500 mt-2 w-full">
//           Cancel
//         </button>
//       </div>
//     </div>
//   );
// }
