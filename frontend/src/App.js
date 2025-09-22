// File: frontend/src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import TuitionPaymentForm from './components/TuitionPaymentForm';

const App = () => {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
    // Có thể thêm logic xóa localStorage nếu dùng
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/dashboard" element={user ? <UserDashboard user={user} onLogout={handleLogout} /> : <Login setUser={setUser} />} />
        <Route path="/payment" element={user ? <TuitionPaymentForm user={user} /> : <Login setUser={setUser} />} />
      </Routes>
    </Router>
  );
};

export default App;