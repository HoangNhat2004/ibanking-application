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
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-green-600 text-center mb-6">
          🌿 Welcome, {user.fullName}
        </h2>

        {/* User Info */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
          <h3 className="text-xl font-semibold text-green-700 mb-3">User Information</h3>
          <div className="grid grid-cols-2 gap-y-2 text-gray-700">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Full Name:</strong> {user.fullName}</p>
            <p><strong>Phone:</strong> {user.phoneNumber}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p className="col-span-2">
              <strong>Balance:</strong>{' '}
              <span className="text-green-600 font-semibold">
                {user.balance.toLocaleString()} VND
              </span>
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h3 className="text-xl font-semibold text-green-700 mb-3">
            Transaction History
          </h3>
          {user.transactionHistory.length > 0 ? (
            <ul className="divide-y divide-gray-200 bg-gray-50 rounded-lg">
              {user.transactionHistory.map((tx, index) => (
                <li key={index} className="p-3 hover:bg-green-50 transition">
                  <p className="text-gray-800">
                    💸 Paid{' '}
                    <span className="text-green-600 font-semibold">
                      {tx.amount.toLocaleString()} VND
                    </span>{' '}
                    for student{' '}
                    <span className="font-medium text-gray-700">{tx.studentId}</span>{' '}
                    on{' '}
                    <span className="text-gray-600">
                      {new Date(tx.date).toLocaleString()}
                    </span>{' '}
                    ({tx.status})
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 italic bg-gray-50 p-3 rounded">
              No transactions yet.
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => navigate('/payment')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow-md font-medium transition"
          >
            💳 Go to Tuition Payment
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md font-medium transition"
          >
            🚪 Logout
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          © 2025 iBanking Student System
        </p>
      </div>
    </div>
  );
};

export default UserDashboard;
