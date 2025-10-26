import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TuitionPaymentForm = ({ user }) => {
  const [studentId, setStudentId] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
  const [otp, setOtp] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const navigate = useNavigate();

  // --- LOGIC GIỮ NGUYÊN ---
  const handleFetchStudentInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/student/${studentId}`);
      setStudentInfo(response.data.student);
      setMessage('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch student info");
      setStudentInfo(null);
    }
  };

  const handleTransactionConfirmation = async () => {
    if (!isTermsAccepted) {
      setError("You must accept the terms and conditions");
      return;
    }
    try {
      const response = await axios.post('http://localhost:3000/api/payment', {
        payerUsername: user.username,
        studentId,
        email: user.email
      });
      setTransactionId(response.data.transactionId);
      setMessage(response.data.message);
      setError('');
      setShowOtpForm(true);
    } catch (err) {
      setError(err.response?.data?.message || "Transaction confirmation failed");
      setMessage('');
    }
  };

  const handleFinalConfirmation = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/confirm-payment', {
        transactionId,
        otpCode: otp,
        payerUsername: user.username,
        studentId
      });
      setMessage(response.data.message);
      setError('');
      setShowOtpForm(false);
      setStudentInfo(null);
      setStudentId('');
      setOtp('');
      setTransactionId('');
      setIsTermsAccepted(false);
      setTimeout(() => navigate('/payment'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Final confirmation failed");
      setMessage('');
    }
  };

  // --- GIAO DIỆN MỚI ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex justify-center items-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-green-200">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-6">
          🎓 Tuition Payment
        </h2>

        {/* Nhập MSSV */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Student ID (MSSV):</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter your student ID"
              className="flex-1 border border-green-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
            <button
              onClick={handleFetchStudentInfo}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              Fetch
            </button>
          </div>
        </div>

        {/* Thông tin sinh viên */}
        {studentInfo && (
          <div className="bg-green-50 p-4 rounded-xl border border-green-200 mb-4">
            <p className="text-gray-800 font-medium">👤 Name: <span className="font-semibold">{studentInfo.fullName}</span></p>
            <p className="text-gray-800 font-medium">💰 Tuition: <span className="font-semibold text-green-700">{studentInfo.tuitionAmount} VND</span></p>

            <div className="mt-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isTermsAccepted}
                  onChange={(e) => setIsTermsAccepted(e.target.checked)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                I accept the <span className="text-green-600 underline">terms and conditions</span>
              </label>
            </div>

            <button
              onClick={handleTransactionConfirmation}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg mt-4 transition"
            >
              Confirm Transaction
            </button>
          </div>
        )}

        {/* OTP */}
        {showOtpForm && (
          <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-green-700 mb-2">Enter OTP</h3>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter your OTP"
              className="w-full border border-green-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
            <button
              onClick={handleFinalConfirmation}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg mt-4 transition"
            >
              Final Confirmation
            </button>
          </div>
        )}

        {/* Thông báo */}
        {message && (
          <p className="text-center text-green-600 font-medium mt-4">{message}</p>
        )}
        {error && (
          <p className="text-center text-red-500 font-medium mt-4">{error}</p>
        )}
      </div>
    </div>
  );
};

export default TuitionPaymentForm;
