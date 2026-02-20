import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import appLogo from '/src/assets/app_picture.png';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log(email);
    console.log(password);

    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_URL}/api/auth/login`, {
        email,
        password,
      });

      const data = response.data;

      if (!data.success) {
        setError(data.error || "Login failed");
      } else {
        localStorage.setItem("token", data.token);
        navigate("/admin-dashboard", { replace: true });
      }
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data?.error ||
            `HTTP error! status: ${err.response.status}`
        );
      } else if (err.request) {
        setError("No response from server. Please check if the server is running.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-teal-400 via-teal-300 to-white flex items-center justify-center p-4">
      {/* Centered Container */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          
          {/* Left Side - Logo/Illustration */}
          <div className="lg:w-1/2 bg-gradient-to-br from-teal-400 via-teal-300 to-white relative overflow-hidden flex items-center justify-center p-12 min-h-[300px] lg:min-h-[600px]">
            {/* Main logo illustration */}
            <div className="flex flex-col items-center">
              <img 
                src={appLogo}  
                alt="EzRent Logo" 
                className="w-64 h-64 lg:w-96 lg:h-96 object-contain drop-shadow-2xl animate-float"
              />
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
            <div className="w-full max-w-md">
              {/* Mobile logo */}
              <div className="lg:hidden flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl shadow-lg flex items-center justify-center mb-3">
                  <div className="text-3xl font-bold text-white">E</div>
                </div>
                <div className="text-blue-500 text-2xl font-bold tracking-wide">
                  EzRent
                </div>
              </div>

              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign in</h1>
                <p className="text-gray-500">Admin Dashboard Access</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
                    <User className="text-gray-400 mr-3" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      required
                      className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
                    <Lock className="text-gray-400 mr-3" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="ml-2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 mr-2" />
                    <span className="text-gray-600">Keep me logged in</span>
                  </label>
                  <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg hover:from-blue-600 hover:to-cyan-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;

//With floating and separate container  

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { User, Lock, Eye, EyeOff } from "lucide-react";
// import appLogo from '/src/assets/app_picture.png';

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     console.log(email);
//     console.log(password);

//     try {
//       const response = await axios.post(`${import.meta.env.VITE_APP_URL}/api/auth/login`, {
//         email,
//         password,
//       });

//       const data = response.data;

//       if (!data.success) {
//         setError(data.error || "Login failed");
//       } else {
//         localStorage.setItem("token", data.token);
//         navigate("/admin-dashboard", { replace: true });
//       }
//     } catch (err) {
//       if (err.response) {
//         setError(
//           err.response.data?.error ||
//             `HTTP error! status: ${err.response.status}`
//         );
//       } else if (err.request) {
//         setError("No response from server. Please check if the server is running.");
//       } else {
//         setError("Something went wrong. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex h-screen w-screen overflow-hidden">
//       {/* Left Side - Illustration */}
//       <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-400 via-blue-400 to-blue-300 relative overflow-hidden items-center justify-center">
       
        
       

//         {/* Main character illustration */}
//           {/* Brand at bottom */}
//           <div className="absolute flex flex-col items-center">
//               <img 
//                 src={appLogo}  
//                 alt="EzRent Logo" 
//                 className="w-96 h-96 object-contain drop-shadow-2xl"
//               />
//           </div>
//       </div>

//       {/* Right Side - Login Form */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
//         <div className="w-full max-w-md">
//           {/* Mobile logo */}
//           <div className="lg:hidden flex flex-col items-center mb-8">
//             <div className="w-16 h-16 bg-blue-500 rounded-2xl shadow-lg flex items-center justify-center mb-3">
//               <div className="text-3xl font-bold text-white">E</div>
//             </div>
//             <div className="text-blue-500 text-2xl font-bold tracking-wide">
//               EzRent
//             </div>
//           </div>

//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign in</h1>
//             <p className="text-gray-500">Admin Dashboard Access</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {error && (
//               <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
//                 {error}
//               </div>
//             )}

//             {/* Email Input */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email
//               </label>
//               <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
//                 <User className="text-gray-400 mr-3" size={20} />
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="name@gmail.com"
//                   required
//                   className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
//                 />
//               </div>
//             </div>

//             {/* Password Input */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
//                 <Lock className="text-gray-400 mr-3" size={20} />
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Enter your password"
//                   required
//                   className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="ml-2 text-gray-400 hover:text-gray-600 transition"
//                 >
//                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </button>
//               </div>
//             </div>

//             {/* Remember me & Forgot Password */}
//             <div className="flex items-center justify-between text-sm">
//               <label className="flex items-center">
//                 <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 mr-2" />
//                 <span className="text-gray-600">Keep me logged in</span>
//               </label>
//               <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">
//                 Forgot password?
//               </a>
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg hover:from-blue-600 hover:to-cyan-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? "Signing in..." : "Sign in"}
//             </button>
//           </form>


//         </div>
//       </div>

//       <style>{`
//         @keyframes float {
//           0%, 100% { transform: translateY(0px); }
//           50% { transform: translateY(-20px); }
//         }
        
//         @keyframes float-delayed {
//           0%, 100% { transform: translateY(0px); }
//           50% { transform: translateY(-15px); }
//         }
        
//         .animate-float {
//           animation: float 6s ease-in-out infinite;
//         }
        
//         .animate-float-delayed {
//           animation: float-delayed 5s ease-in-out infinite;
//           animation-delay: 1s;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Login;