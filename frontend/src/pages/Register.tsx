import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SelectCountryList from 'react-select-country-list';
import OtpModal from '../components/OtpModal';

interface FormDataInterface{
    email: string,
    phone: string,
    userType: string,
    password: string,
    confirmPassword: string,
    firstName: string,
    lastName: string,
    userName: string,
    organizationName?: string,
    location?: string,
    organizationType?: string,
    country: string,

}

const FormDataObj: FormDataInterface = {
  email: '',
    phone: '',
    userType: 'user',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userName: '',
    organizationName: '',
    location: '',
    organizationType: '',
    country: '',
}
export default function Register() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'user' | 'organizer'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [formData, setFormData] = useState<FormDataInterface>(FormDataObj);

  const [passwordStrength, setPasswordStrength] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    userName: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    location: '',
    country: '',
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem('email');
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
    }
  }, []);

  useEffect(() => {
    if (formData.email) {
      localStorage.setItem('email', formData.email);
    }
  }, [formData.email]);

  const countryOptions = SelectCountryList().getData();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, password: value }));
    if (value.length < 6) {
      setPasswordStrength('Weak');
    } else if (/[A-Z]/.test(value) && /\d/.test(value)) {
      setPasswordStrength('Strong');
    } else {
      setPasswordStrength('Medium');
    }
    setErrors((prev) => ({ ...prev, password: '' }));
  };

  const validateFields = () => {
    let hasError = false;
    let errorMessages = { ...errors };

    if (userType === 'user') {
      if (!formData.firstName) {
        errorMessages.firstName = 'This field is required.';
        hasError = true;
      }
      if (!formData.lastName) {
        errorMessages.lastName = 'This field is required.';
        hasError = true;
      }
      if(!formData.userName){
        errorMessages.userName = 'This field is required'
        hasError = true
      }
      if (!formData.email) {
        errorMessages.email = 'This field is required.';
        hasError = true;
      } else if (!/^\S+@\S+$/i.test(formData.email)) {
        errorMessages.email = 'Invalid email format.';
        hasError = true;
      }
      if (!formData.password) {
        errorMessages.password = 'This field is required.';
        hasError = true;
      }
      if (!formData.confirmPassword) {
        errorMessages.confirmPassword = 'This field is required.';
        hasError = true;
      } else if (formData.password !== formData.confirmPassword) {
        errorMessages.confirmPassword = 'Passwords do not match.';
        hasError = true;
      }
    } else {
      if (!formData.organizationName) {
        errorMessages.organizationName = 'This field is required.';
        hasError = true;
      }
      if (!formData.location) {
        errorMessages.location = 'This field is required.';
        hasError = true;
      }
    }

    if (!formData.country) {
      errorMessages.country = 'This field is required.';
      hasError = true;
    }

    setErrors(errorMessages);
    return !hasError;
  };

  const handleNext = async () => {
    setIsLoading(true);
    const isValid = validateFields();

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      // Create user with isVerified: false
      const payload = {
        firstName: userType === 'user' ? formData.firstName : undefined,
        lastName: userType === 'user' ? formData.lastName: undefined,
        userName: userType === 'user' ? formData.userName: undefined,
        email: formData.email ,
        password: formData.password,
        role: userType,
        organizationName: userType === 'organizer' ? formData.organizationName : undefined,
        organizationLocation: userType === 'organizer' ? formData.location : undefined,
        country: formData.country,
        
      };
       const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || 'Failed to create user');

      // Move to step 2 for verification
      setStep(2);
      setShowEmailModal(true); // Auto-show OTP modal
    } catch (error: any) {
      alert('Failed to proceed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!isEmailVerified) {
      alert('Please verify your email first.');
      return;
    }

    try {
      setIsLoading(true);
      // Since user is already created, we could update or just confirm
      alert('Registration completed successfully!');
      // Optionally: Redirect or clear form
      setFormData({
        email: '',
        phone: '',
        userType: 'user',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        userName: '',
        organizationName: '',
        location: '',
        organizationType: '',
        country: '',
      });
      localStorage.removeItem('email');
    } catch (error: any) {
      alert('Error finalizing registration: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-green-900 text-white px-12">
        <h1 className="text-4xl font-bold mb-4">Join Fastix Today!</h1>
        <p className="text-lg">
          Register to explore thrilling events happening near you. Whether you're
          hosting or attending — we’ve got you covered!
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Registering as</label>
              <select
                name="userType"
                value={userType}
                onChange={(e) => {
                  setUserType(e.target.value as 'user' | 'organizer');
                  setFormData((prev) => ({
                    ...prev,
                    userType: e.target.value,
                  }));
                }}
                className="w-full border rounded px-3 py-2"
              >
                <option value="user">User</option>
                <option value="organizer">Organizer</option>
              </select>
            </div>

            {userType === 'organizer' && (
              <>
                <input
                  type="text"
                  name="organizationName"
                  placeholder="Organization Name"
                  onChange={handleChange}
                  value={formData.organizationName}
                  className={`input-style ${errors.organizationName ? 'border-red-500' : ''}`}
                />
                {errors.organizationName && (
                  <div className="text-red-500 text-xs mt-1">{errors.organizationName}</div>
                )}
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  onChange={handleChange}
                  value={formData.location}
                  className={`input-style ${errors.location ? 'border-red-500' : ''}`}
                />
                {errors.location && (
                  <div className="text-red-500 text-xs mt-1">{errors.location}</div>
                )}
                
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    value={formData.email}
                    className={`input-style ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <div className="text-red-500 text-xs mt-1">{errors.email}</div>
                  )}
                          <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handlePasswordChange}
              value={formData.password}
              className={`input-style ${errors.password ? 'border-red-500' : ''}`}
            />
            {errors.password && (
              <div className="text-red-500 text-xs mt-1">{errors.password}</div>
            )}
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              value={formData.confirmPassword}
              className={`input-style ${errors.confirmPassword ? 'border-red-500' : ''}`}
            />
            {errors.confirmPassword && (
              <div className="text-red-500 text-xs mt-1">{errors.confirmPassword}</div>
            )}
            {passwordStrength && (
              <div
                className={`text-sm mt-2 ${
                  passwordStrength === 'Weak'
                    ? 'text-red-500'
                    : passwordStrength === 'Medium'
                    ? 'text-yellow-500'
                    : 'text-green-600'
                }`}
                  >
                    Password Strength: {passwordStrength}
                  </div>
                )}
              </>
            )}

            {userType === 'user' && (
              <>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  onChange={handleChange}
                  value={formData.firstName}
                  className={`input-style ${errors.firstName ? 'border-red-500' : ''}`}
                />
                {errors.firstName && (
                  <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>
                )}
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  onChange={handleChange}
                  value={formData.lastName}
                  className={`input-style ${errors.lastName ? 'border-red-500' : ''}`}
                />
                {errors.lastName && (
                  <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>
                )}

                <input
                  type="text"
                  name="userName"
                  placeholder="username"
                  onChange={handleChange}
                  value={formData.userName}
                  className={`input-style ${errors.userName ? 'border-red-500' : ''}`}
                />
                {errors.userName && (
                  <div className="text-red-500 text-xs mt-1">{errors.userName}</div>
                )}
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  value={formData.email}
                  className={`input-style ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <div className="text-red-500 text-xs mt-1">{errors.email}</div>
                )}
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handlePasswordChange}
                  value={formData.password}
                  className={`input-style ${errors.password ? 'border-red-500' : ''}`}
                />
                {errors.password && (
                  <div className="text-red-500 text-xs mt-1">{errors.password}</div>
                )}
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  onChange={handleChange}
                  value={formData.confirmPassword}
                  className={`input-style ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                {errors.confirmPassword && (
                  <div className="text-red-500 text-xs mt-1">{errors.confirmPassword}</div>
                )}
                {passwordStrength && (
                  <div
                    className={`text-sm mt-2 ${
                      passwordStrength === 'Weak'
                        ? 'text-red-500'
                        : passwordStrength === 'Medium'
                        ? 'text-yellow-500'
                        : 'text-green-600'
                    }`}
                  >
                    Password Strength: {passwordStrength}
                  </div>
                )}
              </>
            )}
            <div>
              <label className="block text-sm font-medium">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${errors.country ? 'border-red-500' : ''}`}
              >
                <option value="">Select a country</option>
                {countryOptions.map((country) => (
                  <option key={country.value} value={country.label}>
                    {country.label}
                  </option>
                ))}
              </select>
              {errors.country && (
                <div className="text-red-500 text-xs mt-1">{errors.country}</div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 mt-4">
              <Link to="/login" className="w-full sm:w-auto">
                <button className="text-green-600 hover:text-green-800 w-full sm:w-auto font-bold">
                  Back
                </button>
              </Link>

              <button
                onClick={handleNext}
                disabled={isLoading}
                className="bg-green-800 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full sm:w-auto flex justify-center items-center gap-2"
              >
                {isLoading && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                )}
                {isLoading ? 'Processing...' : 'Next'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center">Verify {formData.email} Info</h3>

            <div
              className="border p-4 rounded cursor-pointer flex justify-between items-center"
              onClick={() => setShowEmailModal(true)}
            >
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-gray-600">{formData.email}</p>
              </div>
              {isEmailVerified ? (
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span> Verified
                </span>
              ) : (
                <span className="text-red-600 font-semibold">Required</span>
              )}
            </div>

            <button
              onClick={handleFinalSubmit}
              disabled={!isEmailVerified}
              className={`w-full py-2 px-4 rounded text-white ${
                isEmailVerified
                  ? 'bg-green-800 hover:bg-green-600'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Submit
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full text-gray-500 text-sm mt-2"
            >
              Back
            </button>

            {showEmailModal && (
              <OtpModal
                type="email"
                address={formData.email}
                onClose={() => setShowEmailModal(false)}
                onVerified={() => {
                  setIsEmailVerified(true);
                  setShowEmailModal(false);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}