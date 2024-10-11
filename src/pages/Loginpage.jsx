import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const LoginPage = ({ role })=> {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Determine directory based on role
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'user'){
      navigate('/home');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-96">
        <img src={logo} alt="logo" className="w-24 mx-auto mb-4" />
        <h2 className="text-center text-3xl font-bold mb-6 text-purple-700">BLACKGATE</h2>
        <form onSubmit={handleLogin}>
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

          <button className="btn w-full bg-purple-700 hover:bg-purple-800 text-white rounded-2xl">Sign In</button>
        </form>
        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-purple-600">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
