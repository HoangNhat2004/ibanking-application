// File: frontend/src/components/UserDashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2>Welcome, {user.fullName}</h2>
      <h3>User Information</h3>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Full Name:</strong> {user.fullName}</p>
      <p><strong>Phone Number:</strong> {user.phoneNumber}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Available Balance:</strong> {user.balance.toLocaleString()} VND</p>
      <h3>Transaction History</h3>
      {user.transactionHistory.length > 0 ? (
        <ul>
          {user.transactionHistory.map((tx, index) => (
            <li key={index}>
              Paid {tx.amount.toLocaleString()} VND for student {tx.studentId} on {new Date(tx.date).toLocaleString()} ({tx.status})
            </li>
          ))}
        </ul>
      ) : (
        <p>No transactions yet.</p>
      )}
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => navigate('/payment')}
          style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px' }}
        >
          Go to Tuition Payment
        </button>
        <button
          onClick={handleLogout}
          style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;