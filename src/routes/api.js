// File: src/routes/api.js
// Endpoint cho đăng nhập, lấy thông tin sinh viên, xác nhận thanh toán và xác thực OTP

const express = require('express');
const router = express.Router();
const { connectDB } = require('../db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nhnhat202@gmail.com', // Email của bạn
    pass: 'zlzu xsbu qrfz powu' // Thay bằng App Password 16 ký tự
  }
});

async function sendEmail(to, subject, text) {
  try {
    const mailOptions = {
      from: 'nhnhat202@gmail.com',
      to,
      subject,
      text
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    throw error;
  }
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log(`Processing login for username: ${username}`);

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" });
  }

  try {
    const db = await connectDB();
    console.log("Connected to MongoDB for login");
    const user = await db.collection('users').findOne({ username, password });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    res.json({
      success: true,
      user: {
        username: user.username,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        balance: user.balance,
        transactionHistory: user.transactionHistory
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params;

  console.log(`Fetching student info for studentId: ${studentId}`);

  try {
    const db = await connectDB();
    console.log("Connected to MongoDB for student query");
    const student = await db.collection('students').findOne({ studentId: studentId.trim() });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({
      success: true,
      student: {
        studentId: student.studentId,
        fullName: student.fullName,
        tuitionAmount: student.tuitionAmount
      }
    });
  } catch (error) {
    console.error("Student query error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post('/payment', async (req, res) => {
  const { payerUsername, studentId, email } = req.body;

  console.log(`Processing payment for username: ${payerUsername}, studentId: ${studentId}`);

  if (!payerUsername || !studentId || !email) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  let db;
  try {
    db = await connectDB();
    console.log("Connected to MongoDB for payment processing");

    const user = await db.collection('users').findOne({ username: payerUsername });
    if (!user) {
      console.log(`User not found: ${payerUsername}`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const queryStudentId = studentId.trim();
    console.log(`Querying student with studentId: ${queryStudentId}`);

    let student = await db.collection('students').findOne({ studentId: queryStudentId });
    console.log(`Student query result for ${queryStudentId}: exists=${!!student}`);

    if (!student) {
      return res.status(400).json({ success: false, message: "Student not found" });
    }

    if (student.isPaid) {
      return res.status(400).json({ success: false, message: "Student tuition already paid" });
    }

    // Kiểm tra và tự động mở khóa nếu khóa cũ quá 5 phút
    if (student.lockedBy) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (student.lockedBy < fiveMinutesAgo) {
        console.log(`Old lock detected, unlocking student: ${queryStudentId}`);
        await db.collection('students').updateOne(
          { studentId: queryStudentId },
          { $set: { lockedBy: null } }
        );
        student = await db.collection('students').findOne({ studentId: queryStudentId });
      } else {
        return res.status(400).json({ success: false, message: "Student tuition is being processed by another transaction" });
      }
    }

    // Khóa sinh viên
    const updateResult = await db.collection('students').findOneAndUpdate(
      { studentId: queryStudentId, lockedBy: null, isPaid: false },
      { $set: { lockedBy: new Date() } },
      { returnDocument: 'after' }
    );
    console.log(`Student lock result for ${queryStudentId}: success=${!!updateResult}`);

    if (!updateResult) {
      return res.status(400).json({ success: false, message: "Failed to lock student record" });
    }

    const amount = student.tuitionAmount;
    if (user.balance < amount) {
      console.log(`Insufficient balance for user: ${payerUsername}, Balance: ${user.balance}, Required: ${amount}`);
      await db.collection('students').updateOne(
        { studentId: queryStudentId },
        { $set: { lockedBy: null } }
      );
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    const transactionId = new Date().getTime().toString();
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 5 * 60 * 1000);

    await db.collection('otps').insertOne({
      transactionId,
      code: otpCode,
      email,
      issuedAt,
      expiresAt,
      studentId: queryStudentId,
      payerUsername
    });

    await sendEmail(email, "Your OTP Code", `Your OTP code is ${otpCode}. It expires in 5 minutes.`);

    res.json({ success: true, message: "OTP sent successfully", transactionId });
  } catch (error) {
    console.error("Payment processing error:", error.message);
    if (db) {
      await db.collection('students').updateOne(
        { studentId: studentId.trim() },
        { $set: { lockedBy: null } }
      );
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/confirm-payment', async (req, res) => {
  const { transactionId, otpCode, payerUsername, studentId } = req.body;

  console.log(`Processing confirm payment for transactionId: ${transactionId}, username: ${payerUsername}, studentId: ${studentId}`);

  if (!transactionId || !otpCode || !payerUsername || !studentId) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  let db;
  try {
    db = await connectDB();
    console.log("Connected to MongoDB for OTP verification");

    const otp = await db.collection('otps').findOne({ transactionId, code: otpCode });
    if (!otp) {
      await db.collection('students').updateOne(
        { studentId: studentId.trim() },
        { $set: { lockedBy: null } }
      );
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const now = new Date();
    if (now > otp.expiresAt) {
      await db.collection('students').updateOne(
        { studentId: studentId.trim() },
        { $set: { lockedBy: null } }
      );
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    if (otp.payerUsername !== payerUsername || otp.studentId !== studentId.trim()) {
      await db.collection('students').updateOne(
        { studentId: studentId.trim() },
        { $set: { lockedBy: null } }
      );
      return res.status(400).json({ success: false, message: "Invalid transaction details" });
    }

    const student = await db.collection('students').findOne({ studentId: studentId.trim(), lockedBy: { $ne: null }, isPaid: false });
    if (!student) {
      await db.collection('students').updateOne(
        { studentId: studentId.trim() },
        { $set: { lockedBy: null } }
      );
      return res.status(400).json({ success: false, message: "Student not found, already paid, or not locked" });
    }

    const user = await db.collection('users').findOne({ username: payerUsername });
    if (!user) {
      await db.collection('students').updateOne(
        { studentId: studentId.trim() },
        { $set: { lockedBy: null } }
      );
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const amount = student.tuitionAmount;
    if (user.balance < amount) {
      await db.collection('students').updateOne(
        { studentId: studentId.trim() },
        { $set: { lockedBy: null } }
      );
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // Cập nhật số dư người dùng
    await db.collection('users').updateOne(
      { username: payerUsername },
      {
        $inc: { balance: -amount },
        $push: {
          transactionHistory: {
            transactionId,
            studentId: studentId.trim(),
            amount,
            date: new Date(),
            status: 'success'
          }
        }
      }
    );

    // Cập nhật trạng thái thanh toán của sinh viên
    await db.collection('students').updateOne(
      { studentId: studentId.trim() },
      { $set: { isPaid: true, lockedBy: null } }
    );

    // Xóa OTP sau khi sử dụng
    await db.collection('otps').deleteOne({ transactionId });

    // Gửi email xác nhận
    const confirmationMessage = `Transaction successful! You have paid ${amount} VND for student ${studentId}. Transaction ID: ${transactionId}.`;
    await sendEmail(otp.email, "Transaction Confirmation", confirmationMessage);

    res.json({ success: true, message: "Transaction completed successfully" });
  } catch (error) {
    console.error("Confirm payment error:", error.message);
    if (db) {
      await db.collection('students').updateOne(
        { studentId: studentId.trim() },
        { $set: { lockedBy: null } }
      );
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;