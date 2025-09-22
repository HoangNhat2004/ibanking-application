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
      console.log("Sending login request to: http://localhost:3000/api/login");
      console.log("Request payload:", { username: username.trim(), password: password.trim() });
      try {
        const response = await axios.post('http://localhost:3000/api/login', {
          username: username.trim(),
          password: password.trim()
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
        console.log("Response from server:", response.data);
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
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </div>
          <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
            Login
          </button>
        </form>
      </div>
    );
  };

  export default Login;