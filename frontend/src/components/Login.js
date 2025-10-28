// File: frontend/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Chỉ log thông tin không nhạy cảm trong development
    if (process.env.NODE_ENV !== 'production') {
      console.log("Sending login request to: http://localhost:3000/api/login");
      console.log("Request payload:", { username: username.trim() });
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/api/login',
        { username: username.trim(), password: password.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (process.env.NODE_ENV !== 'production') {
        console.log("Response from server:", response.data);
      }

      if (response.data.success) {
        setUser(response.data.user);
        navigate('/dashboard');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error("Login error:", err.message, err.response?.data);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-green-600">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-green-600 mb-6">🌿 iBanking Login</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg shadow transition-all"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          © 2025 iBanking Student System
        </p>
      </div>
    </div>
  );
};

export default Login;