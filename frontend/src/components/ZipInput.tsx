// import  { useState, useEffect } from 'react';
// import { useForm, Controller,} from 'react-hook-form';
// import SelectCountryList from 'react-select-country-list';

// interface RegisterFormData {
//   userType: 'user' | 'organizer';
//   firstName: string;
//   lastName: string;
//   email?: string;
//   organizationName?: string;
//   organizationAddress?: string;
//   country: string;
//   password: string;
// }

// interface CountryOption {
//   value: string;
//   label: string;
// }

// const RegisterForm = () => {
//   const { control, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
//     defaultValues: {
//       userType: 'user',
//       firstName: '',
//       lastName: '',
//       email: '',
//       organizationName: '',
//       organizationAddress: '',
//       country: '',
//       password: '',
//     },
//   });

//   const [stage, setStage] = useState(1); // 1 for registration, 2 for email/phone verification
//   const currentUserType = watch('userType');
//   const [loading, setLoading] = useState(false);
//   const [passwordStrength, setPasswordStrength] = useState('');
//   const password = watch('password');

//   const countryOptions: CountryOption[] = SelectCountryList().getData();

//   useEffect(() => {
//     if (!password) {
//       setPasswordStrength('');
//     } else if (password.length < 6) {
//       setPasswordStrength('Weak');
//     } else if (password.match(/[A-Z]/) && password.match(/[0-9]/)) {
//       setPasswordStrength('Strong');
//     } else {
//       setPasswordStrength('Medium');
//     }
//   }, [password]);

//   const handleNext = async (data: RegisterFormData) => {
//     try {
//       setLoading(true);
//       const payload = {
//         ...data,
//         ...(data.userType === 'user' ? { email: data.email } : { organizationName: data.organizationName, organizationAddress: data.organizationAddress }),
//       };

//       // Send registration details to backend (submit the form data)
//       const res = await fetch('http://localhost:5000/api/auth/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const result: { message: string } = await res.json();

//       if (!res.ok) throw new Error(result.message || 'Something went wrong');

//       alert('Registration successful!');
//       setStage(2); // Move to email/phone verification stage
//     } catch (error: any) {
//       alert('Registration failed: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerificationSubmit = (data: any) => {
//     // Handle the email and phone verification logic here
//     alert('Verification successful!');
//   };

//   return (
//     <div className="flex w-full min-h-screen">
//       {/* Left side */}
//       <div className="w-1/2 bg-blue-700 text-white p-10 flex flex-col justify-center">
//         <h2 className="text-3xl font-bold mb-4">Join FAST FIX TODAY</h2>
//         <p className="text-lg">Create your account and start your journey.</p>
//       </div>

//       {/* Right side */}
//       <div className="flex flex-1 flex-col justify-center px-6 py-14 lg:px-8">
//         {stage === 1 && (
//           <form onSubmit={handleSubmit(handleNext)}>
//             <h2 className="text-2xl font-semibold mb-6">Create Account</h2>

//             {/* User Type */}
//             <label className="mb-2 font-medium">User Type</label>
//             <Controller
//               name="userType"
//               control={control}
//               rules={{ required: 'User type is required' }}
//               render={({ field }) => (
//                 <select {...field} className="border rounded p-2 w-full mb-4">
//                   <option value="user">User</option>
//                   <option value="organizer">Organizer</option>
//                 </select>
//               )}
//             />
//             {errors.userType && <p className="text-red-500">{errors.userType.message}</p>}

//             {/* Common Fields */}
//             <label className="mb-2 font-medium">First Name</label>
//             <Controller
//               name="firstName"
//               control={control}
//               rules={{ required: 'First name is required' }}
//               render={({ field }) => <input {...field} className="border rounded p-2 w-full mb-4" />}
//             />
//             {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}

//             <label className="mb-2 font-medium">Last Name</label>
//             <Controller
//               name="lastName"
//               control={control}
//               rules={{ required: 'Last name is required' }}
//               render={({ field }) => <input {...field} className="border rounded p-2 w-full mb-4" />}
//             />
//             {errors.lastName && <p className="text-red-500">{errors.lastName.message}</p>}

//             {/* Conditional Fields */}
//             {currentUserType === 'user' && (
//               <>
//                 <label className="mb-2 font-medium">Email</label>
//                 <Controller
//                   name="email"
//                   control={control}
//                   rules={{ required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } }}
//                   render={({ field }) => <input {...field} type="email" className="border rounded p-2 w-full mb-4" />}
//                 />
//                 {errors.email && <p className="text-red-500">{errors.email.message}</p>}
//               </>
//             )}

//             {currentUserType === 'organizer' && (
//               <>
//                 <label className="mb-2 font-medium">Organization Name</label>
//                 <Controller
//                   name="organizationName"
//                   control={control}
//                   rules={{ required: 'Organization name is required' }}
//                   render={({ field }) => <input {...field} className="border rounded p-2 w-full mb-4" />}
//                 />
//                 {errors.organizationName && <p className="text-red-500">{errors.organizationName.message}</p>}

//                 <label className="mb-2 font-medium">Organization Address</label>
//                 <Controller
//                   name="organizationAddress"
//                   control={control}
//                   rules={{ required: 'Organization address is required' }}
//                   render={({ field }) => <input {...field} className="border rounded p-2 w-full mb-4" />}
//                 />
//                 {errors.organizationAddress && <p className="text-red-500">{errors.organizationAddress.message}</p>}
//               </>
//             )}

//             {/* Country Selection */}
//             <label className="mb-2 font-medium">Country</label>
//             <Controller
//               name="country"
//               control={control}
//               rules={{ required: 'Country is required' }}
//               render={({ field }) => (
//                 <select {...field} className="border rounded p-2 w-full mb-4">
//                   <option value="">Select a country</option>
//                   {countryOptions.map((country) => (
//                     <option key={country.value} value={country.label}>
//                       {country.label}
//                     </option>
//                   ))}
//                 </select>
//               )}
//             />
//             {errors.country && <p className="text-red-500">{errors.country.message}</p>}

//             {/* Password */}
//             <label className="mb-2 font-medium">Password</label>
//             <Controller
//               name="password"
//               control={control}
//               rules={{ required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } }}
//               render={({ field }) => <input {...field} type="password" className="border rounded p-2 w-full mb-4" />}
//             />
//             {errors.password && <p className="text-red-500">{errors.password.message}</p>}
//             {passwordStrength && (
//               <p className={`text-sm mb-4 ${passwordStrength === 'Weak' ? 'text-red-500' : passwordStrength === 'Medium' ? 'text-yellow-500' : 'text-green-600'}`}>
//                 Password Strength: {passwordStrength}
//               </p>
//             )}

//             {/* "Next" Button (instead of Submit) */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition"
//             >
//               {loading ? 'Loading...' : 'Next'}
//             </button>
//           </form>
//         )}

//         {stage === 2 && (
//           <form onSubmit={handleVerificationSubmit}>
//             <h2 className="text-2xl font-semibold mb-6">Email & Phone Verification</h2>
//             {/* Add email and phone verification fields here */}
//             <div>
//               <label>Email Verification</label>
//               <input type="text" placeholder="Enter verification code" className="border rounded p-2 w-full mb-4" />
//             </div>
//             <div>
//               <label>Phone Verification</label>
//               <input type="text" placeholder="Enter verification code" className="border rounded p-2 w-full mb-4" />
//             </div>
//             <button type="submit" className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700 transition">
//               Verify
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RegisterForm;
