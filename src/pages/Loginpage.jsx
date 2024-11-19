import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import Loader from '../components/Loader';

const LoginPage = ({ role }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enabled2fa, setEnabled2fa] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: 2fa/password
  const [sliding, setSliding] = useState(false);
  const navigate = useNavigate();

  const handleNextStep = async (e) => {
    e.preventDefault();
    setSliding(true);
    await fetchUser();
    
    // Small delay for animation
    setTimeout(() => {
      setStep(2);
      setSliding(false);
    }, 300);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'user') {
      navigate('/home');
    }
  };

  const fetchUser = async () => {
    // Dummy API call
    console.log(email);
    const user = {
      email: 'johndoe@mail.com',
      enabled2fa: false, // Toggle this to test different flows
    };
    setEnabled2fa(user.enabled2fa);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600">
      <div className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 overflow-hidden">
        <img src={logo} alt="logo" className="w-24 mx-auto mb-4" />
        <h2 className="text-center text-3xl font-bold mb-6 text-primary">BLACKGATE</h2>
     
        <div className={`transition-transform duration-300 ${sliding ? '-translate-x-full' : 'translate-x-0'}`}>
          {step === 1 ? (
            <form onSubmit={handleNextStep}>
              <div className="mb-4">
                <input
                  type="email"
                  className="input input-bordered w-full rounded-2xl"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl">
                Next
              </button>
            </form>
          ) : (
            <div className={`transition-transform duration-300 ${sliding ? 'translate-x-full' : 'translate-x-0'}`}>
              {enabled2fa ? (
                <div className="text-center">
                  <p className="mb-4">Please open the BlackGate mobile app on your phone in order to proceed with 2FA verification.</p>
                  <p className="text-sm text-gray-600">Check your phone for the authentication code</p>
                </div>
              ) : (
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <input
                      type="password"
                      className="input input-bordered w-full rounded-2xl"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl">
                    Sign In
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-purple-600">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;