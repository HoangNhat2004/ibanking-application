// File: frontend/src/TuitionPaymentForm.js
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

  const handleFetchStudentInfo = async () => {
    console.log(`Fetching student info for studentId: ${studentId}`);
    try {
      const response = await axios.get(`http://localhost:3000/api/student/${studentId}`);
      console.log("Student response:", response.data);
      setStudentInfo(response.data.student);
      setMessage('');
      setError('');
    } catch (err) {
      console.error("Fetch student info error:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Failed to fetch student info");
      setStudentInfo(null);
    }
  };

  const handleTransactionConfirmation = async () => {
    console.log(`Confirming transaction for studentId: ${studentId}`);
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
      console.log("Transaction confirmation response:", response.data);
      setTransactionId(response.data.transactionId);
      setMessage(response.data.message);
      setError('');
      setShowOtpForm(true);
    } catch (err) {
      console.error("Transaction confirmation error:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Transaction confirmation failed");
      setMessage('');
    }
  };

  const handleFinalConfirmation = async () => {
    console.log(`Final confirmation with OTP: ${otp}, transactionId: ${transactionId}`);
    try {
      const response = await axios.post('http://localhost:3000/api/confirm-payment', {
        transactionId,
        otpCode: otp,
        payerUsername: user.username,
        studentId
      });
      console.log("Final confirmation response:", response.data);
      setMessage(response.data.message);
      setError('');
      setShowOtpForm(false);
      setStudentInfo(null);
      setStudentId('');
      setOtp('');
      setTransactionId('');
      setIsTermsAccepted(false);
      // Quay lại trang chuyển khoản
      setTimeout(() => navigate('/payment'), 2000);
    } catch (err) {
      console.error("Final confirmation error:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Final confirmation failed");
      setMessage('');
    }
  };

  return (
    <div>
      <h2>Tuition Payment</h2>
      <div>
        <label>Student ID (MSSV):</label>
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <button onClick={handleFetchStudentInfo}>Fetch Student Info</button>
      </div>

      {studentInfo && (
        <div>
          <p>Student Name: {studentInfo.fullName}</p>
          <p>Tuition Amount: {studentInfo.tuitionAmount} VND</p>
          <label>
            <input
              type="checkbox"
              checked={isTermsAccepted}
              onChange={(e) => setIsTermsAccepted(e.target.checked)}
            />
            I accept the terms and conditions
          </label>
          <button onClick={handleTransactionConfirmation}>Transaction Confirmation</button>
        </div>
      )}

      {showOtpForm && (
        <div>
          <h3>Enter OTP</h3>
          <label>OTP Code:</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleFinalConfirmation}>Final Confirmation</button>
        </div>
      )}

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default TuitionPaymentForm;