import React, { useState, useEffect } from "react";
import { FaBuilding, FaUser } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get initial type from URL params or localStorage, default to "user"
  const getInitialType = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeFromUrl = urlParams.get('type');
    const typeFromStorage = localStorage.getItem('userType');
    
    if (typeFromUrl && (typeFromUrl === 'user' || typeFromUrl === 'company')) {
      return typeFromUrl;
    }
    if (typeFromStorage && (typeFromStorage === 'user' || typeFromStorage === 'company')) {
      return typeFromStorage;
    }
    return "user";
  };

  const [type, setType] = useState(getInitialType()); // "user" or "company"
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    companyName: "",
  });
  const [credentialFile, setCredentialFile] = useState(null);
  const [message, setMessage] = useState("");

  // Update type when URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const typeFromUrl = urlParams.get('type');
    if (typeFromUrl && (typeFromUrl === 'user' || typeFromUrl === 'company')) {
      setType(typeFromUrl);
      localStorage.setItem('userType', typeFromUrl);
    }
  }, [location.search]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    
    // Save to localStorage and update URL
    localStorage.setItem('userType', newType);
    const url = new URL(window.location);
    url.searchParams.set('type', newType);
    window.history.replaceState({}, '', url);
    
    setForm({
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
      companyName: "",
    });
    setCredentialFile(null);
    setMessage("");
  };

  const handleFileChange = (e) => {
    setCredentialFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    let endpoint = type === "user" ? "/auth/register" : "/company/register";

    if (type === "company") {
      const formData = new FormData();
      formData.append("companyName", form.companyName);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("phoneNumber", form.phoneNumber);
      if (credentialFile) {
        formData.append("credentialFile", credentialFile);
      }
      try {
        const res = await fetch(`http://localhost:3000${endpoint}`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        const data = await res.json();
        setMessage(data.message);
        
        // Redirect to login page if registration is successful
        if (res.ok && (data.message?.includes('successful') || data.message?.includes('created') || data.message?.includes('registered'))) {
          setTimeout(() => {
            navigate('/signin');
          }, 2000); // Wait 2 seconds to show the success message
        }
      } catch (err) {
        console.error('Company registration error:', err);
        setMessage("Registration failed.");
      }
    } else {
      // User registration
      try {
        const res = await fetch(`http://localhost:3000${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            phoneNumber: form.phoneNumber,
          }),
          credentials: "include",
        });
        const data = await res.json();
        setMessage(data.message);
        
        // Redirect to login page if registration is successful
        if (res.ok && (data.message?.includes('successful') || data.message?.includes('created') || data.message?.includes('registered'))) {
          setTimeout(() => {
            navigate('/signin');
          }, 2000); // Wait 2 seconds to show the success message
        }
      } catch (err) {
        console.error('User registration error:', err);
        setMessage("Registration failed.");
      }
    }
  };

  return (
    <div className='w-full h-screen flex'>
      {/* Desktop Layout - Left Section Visual/Branding */}
      <div className='hidden lg:flex lg:w-1/2 bg-[#0D6EFD] items-center justify-center relative overflow-hidden'>
        <div className='text-white text-center z-10'>
          <h1 className='text-4xl font-bold mb-4'>Welcome to Job Hive</h1>
          <p className='text-xl opacity-90 mb-8'>
            {type === "user" 
              ? "Find your dream job and advance your career with top companies" 
              : "Find top talent effortlessly and grow your team with the best candidates"
            }
          </p>
          <div className='flex items-center justify-center'>
            <div className='w-32 h-32 bg-white/20 rounded-full flex items-center justify-center'>
              <div className='w-20 h-20 bg-white/30 rounded-full flex items-center justify-center'>
                {type === "user" ? (
                  <FaUser className='w-10 h-10 text-white' />
                ) : (
                  <FaBuilding className='w-10 h-10 text-white' />
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Background decorative elements with floating animations */}
        <div className='absolute top-10 left-10 w-20 h-20 bg-[#F4B400] rounded-full animate-float-1 opacity-80'></div>
        <div className='absolute bottom-10 right-10 w-32 h-32 bg-[#F4B400] rounded-full animate-float-2 opacity-70'></div>
        <div className='absolute top-1/2 left-1/4 w-16 h-16 bg-[#F4B400] rounded-full animate-float-3 opacity-90'></div>
        <div className='absolute top-20 right-1/4 w-12 h-12 bg-white/20 rounded-full animate-float-4 opacity-60'></div>
        <div className='absolute bottom-1/3 left-1/3 w-24 h-24 bg-white/15 rounded-full animate-float-5 opacity-50'></div>
        <div className='absolute top-1/3 right-20 w-8 h-8 bg-[#F4B400] rounded-full animate-float-6 opacity-75'></div>
        
        {/* Additional floating styles */}
        <style jsx>{`
          @keyframes float-1 {
            0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
            25% { transform: translateY(-20px) translateX(10px) rotate(90deg); }
            50% { transform: translateY(-10px) translateX(-15px) rotate(180deg); }
            75% { transform: translateY(-25px) translateX(5px) rotate(270deg); }
          }
          
          @keyframes float-2 {
            0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
            33% { transform: translateY(15px) translateX(-20px) rotate(120deg); }
            66% { transform: translateY(-10px) translateX(10px) rotate(240deg); }
          }
          
          @keyframes float-3 {
            0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
            50% { transform: translateY(-30px) translateX(20px) scale(1.1); }
          }
          
          @keyframes float-4 {
            0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
            25% { transform: translateY(20px) translateX(-10px) rotate(-90deg); }
            50% { transform: translateY(5px) translateX(15px) rotate(-180deg); }
            75% { transform: translateY(-15px) translateX(-5px) rotate(-270deg); }
          }
          
          @keyframes float-5 {
            0%, 100% { transform: translateY(0px) translateX(0px) scale(1) rotate(0deg); }
            20% { transform: translateY(-10px) translateX(10px) scale(0.9) rotate(72deg); }
            40% { transform: translateY(5px) translateX(-15px) scale(1.1) rotate(144deg); }
            60% { transform: translateY(-20px) translateX(8px) scale(0.95) rotate(216deg); }
            80% { transform: translateY(10px) translateX(-5px) scale(1.05) rotate(288deg); }
          }
          
          @keyframes float-6 {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            33% { transform: translateY(-25px) translateX(15px); }
            66% { transform: translateY(10px) translateX(-10px); }
          }
          
          .animate-float-1 { animation: float-1 8s ease-in-out infinite; }
          .animate-float-2 { animation: float-2 12s ease-in-out infinite; }
          .animate-float-3 { animation: float-3 6s ease-in-out infinite; }
          .animate-float-4 { animation: float-4 10s ease-in-out infinite; }
          .animate-float-5 { animation: float-5 15s ease-in-out infinite; }
          .animate-float-6 { animation: float-6 7s ease-in-out infinite; }
        `}</style>
      </div>

      {/* Mobile & Desktop Layout - Registration Form Section */}
      <div className='w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative
                      lg:bg-white 
                      bg-[#0D6EFD] overflow-hidden'>
        
        {/* Mobile Background - Decorative elements (only visible on mobile) */}
        <div className='lg:hidden absolute inset-0 overflow-hidden'>
          <div className='absolute top-8 left-8 w-16 h-16 bg-[#F4B400] rounded-full animate-float-1 opacity-60'></div>
          <div className='absolute bottom-8 right-8 w-24 h-24 bg-[#F4B400] rounded-full animate-float-2 opacity-50'></div>
          <div className='absolute top-1/3 right-1/4 w-12 h-12 bg-[#F4B400] rounded-full animate-float-3 opacity-70'></div>
          <div className='absolute top-16 right-12 w-8 h-8 bg-white/20 rounded-full animate-float-4 opacity-40'></div>
          <div className='absolute bottom-1/4 left-1/4 w-20 h-20 bg-white/15 rounded-full animate-float-5 opacity-35'></div>
          <div className='absolute top-2/3 left-8 w-10 h-10 bg-[#F4B400] rounded-full animate-float-6 opacity-55'></div>
        </div>
        
        {/* Registration Type Selector - Top Right (Fixed for both mobile and desktop) */}
        <div className='absolute top-6 right-6 z-20'>
          <div className='flex items-center justify-center'>
            <div className='relative lg:bg-gray-100 bg-white/20 backdrop-blur-sm rounded-full p-1 w-fit'>
              {/* Background slider */}
              <div 
                className={`absolute top-1 left-1 h-8 w-28 bg-blue-600 rounded-full transition-transform duration-300 ease-in-out ${
                  type === 'user' ? 'translate-x-28' : 'translate-x-0'
                }`}
              ></div>
              
              <div className='relative z-10 flex'>
                {/* Company Option */}
                <button
                  type='button'
                  onClick={() => handleTypeChange({ target: { value: 'company' } })}
                  className={`flex items-center justify-center px-2 py-2 rounded-full text-xs font-medium transition-colors duration-300 w-28 ${
                    type === 'company' 
                      ? 'text-white' 
                      : 'lg:text-gray-600 lg:hover:text-gray-800 text-white/80 hover:text-white'
                  }`}
                >
                  <FaBuilding className='w-3 h-3 mr-1' />
                  Company
                </button>
                
                {/* Job Seeker Option */}
                <button
                  type='button'
                  onClick={() => handleTypeChange({ target: { value: 'user' } })}
                  className={`flex items-center justify-center px-2 py-2 rounded-full text-xs font-medium transition-colors duration-300 w-28 ${
                    type === 'user' 
                      ? 'text-white' 
                      : 'lg:text-gray-600 lg:hover:text-gray-800 text-white/80 hover:text-white'
                  }`}
                >
                  <FaUser className='w-3 h-3 mr-1' />
                  Job Seeker
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Container - Styled differently for mobile vs desktop */}
        <div className='w-full max-w-md relative z-10 
                        lg:bg-transparent lg:p-0 lg:shadow-none lg:rounded-none
                        bg-white/95 backdrop-blur-md p-8 shadow-2xl rounded-2xl border border-white/20'>
          <div className='mb-5'>
            <h2 className='text-3xl font-bold lg:text-gray-900 text-gray-900 mb-2 hidden md:block'>
              {type === "user" ? "Let's Create your Account" : "Create your Company Account"}
            </h2>
            <h2 className='text-2xl font-bold lg:text-gray-900 text-gray-900 mb-2 md:hidden block'>
              {type === "user" ? "Create your Account" : "Create Company Account"}
            </h2>
            <p className='lg:text-gray-600 text-gray-700 hidden md:block'>
              {type === "user" 
                ? "Start your career journey and find amazing opportunities"
                : "Start recruiting top talent and build your dream team today"
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-3'>
            {type === "user" ? (
              <>
                {/* Full Name Field */}
                <div>
                  <label htmlFor='fullName' className='block text-sm font-medium text-gray-700 mb-1'>
                    Full Name
                  </label>
                  <input
                    type='text'
                    id='fullName'
                    name='fullName'
                    value={form.fullName}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
                    placeholder='Enter your full name'
                    required
                  />
                </div>
                
                {/* Phone Number Field */}
                <div>
                  <label htmlFor='phoneNumber' className='block text-sm font-medium text-gray-700 mb-1'>
                    Phone Number
                  </label>
                  <input
                    type='tel'
                    id='phoneNumber'
                    name='phoneNumber'
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
                    placeholder='Enter your phone number'
                    required
                  />
                </div>
              </>
            ) : (
              <>
                {/* Company Name Field */}
                <div>
                  <label htmlFor='companyName' className='block text-sm font-medium text-gray-700 mb-1'>
                    Company Name
                  </label>
                  <input
                    type='text'
                    id='companyName'
                    name='companyName'
                    value={form.companyName}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
                    placeholder='Enter your company name'
                    required
                  />
                </div>

                {/* Phone Number Field */}
                <div>
                  <label htmlFor='phoneNumber' className='block text-sm font-medium text-gray-700 mb-1'>
                    Phone Number
                  </label>
                  <input
                    type='tel'
                    id='phoneNumber'
                    name='phoneNumber'
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
                    placeholder='Enter your phone number'
                    required
                  />
                </div>

                {/* Company Credentials Field */}
                <div>
                  <label htmlFor='credentialFile' className='block text-sm font-medium text-gray-700 mb-1'>
                    Company Credentials
                  </label>
                  <div className='relative'>
                    <input
                      type='file'
                      id='credentialFile'
                      name='credentialFile'
                      onChange={handleFileChange}
                      accept='.pdf,.jpg,.jpeg,.png'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                      required
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      Upload PDF, JPG, or PNG files only
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
                Email Address
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={form.email}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
                placeholder='Enter your email address'
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
                Password
              </label>
              <input
                type='password'
                id='password'
                name='password'
                value={form.password}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
                placeholder='Create a password'
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              className='w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium'
            >
              Create Account
            </button>
          </form>

          {/* Message Display */}
          {message && (
            <div className={`mt-5 py-3 px-4 rounded-lg text-center text-sm ${
              message.includes('successful') || message.includes('created')
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* Sign In Link */}
          <div className='text-center mt-6'>
            <p className='text-gray-600'>
              Already have an account?{' '}
              <a href={`/signin?type=${type}`} className='text-blue-600 hover:text-blue-700 font-medium'>
                Sign in
              </a>
            </p>
          </div>

          {/* Social Registration Options - Only for Job Seekers */}
          {type === "user" && (
            <div className='mt-6'>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-300'></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 bg-white text-gray-500'>Or continue with</span>
                </div>
              </div>

              <div className='mt-6 gap-3'>
                <a href="http://localhost:3000/auth/google">
                  <button className='w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition duration-200'>
                    <svg className='w-5 h-5' viewBox='0 0 24 24'>
                      <path fill='currentColor' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
                      <path fill='currentColor' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
                      <path fill='currentColor' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
                      <path fill='currentColor' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
                    </svg>
                    <span className='ml-2'>Google</span>
                  </button>
                </a>
              </div>
            </div>
          )}

          {/* Company Registration Notice */}
          {type === "company" && (
            <div className='mt-6 p-4 lg:bg-blue-50 bg-blue-50/90 border border-blue-200 rounded-lg backdrop-blur-sm'>
              <div className='flex items-center'>
                <FaBuilding className='w-4 h-4 text-blue-600 mr-2' />
                <p className='text-sm text-blue-800'>
                  Company accounts require credential-based registration with document verification for enhanced security.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}