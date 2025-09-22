// File: transaction.js
// Hàm xử lý giao dịch thanh toán học phí với dữ liệu mẫu mới

const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');

const uri = "mongodb://localhost:27017/iBanking?replicaSet=rs0"; // URI với replica set
const client = new MongoClient(uri);

async function processTuitionPayment(payerUsername, studentId, email) {
  const session = client.startSession();
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db("iBanking");

    // Bắt đầu transaction
    await session.withTransaction(async () => {
      // 1. Tìm người dùng dựa trên username
      const user = await db.collection('users').findOne(
        { username: payerUsername },
        { session }
      );

      console.log("User found:", user); // Debug: In thông tin người dùng
      if (!user) {
        throw new Error("User not found");
      }

      // 2. Tìm sinh viên và khóa để tránh xung đột
      const student = await db.collection('students').findOneAndUpdate(
        { studentId, lockedBy: null, isPaid: false },
        { $set: { lockedBy: new ObjectId() } },
        { session, returnDocument: 'after' }
      );

      console.log("Student found:", student); // Debug: In thông tin sinh viên
      if (!student) {
        throw new Error("Student not found, already paid, or being processed");
      }

      // 3. Kiểm tra số dư
      const amount = student.tuitionAmount;
      if (user.balance < amount) {
        throw new Error("Insufficient balance");
      }

      // 4. Tạo OTP
      const otpCode = crypto.randomInt(100000, 999999).toString();
      const issuedAt = new Date();
      const expiresAt = new Date(issuedAt.getTime() + 5 * 60 * 1000); // Hết hạn sau 5 phút

      await db.collection('otps').insertOne({
        transactionId: new ObjectId(),
        code: otpCode,
        email,
        issuedAt,
        expiresAt
      }, { session });

      // Giả lập gửi OTP qua email
      console.log(`OTP ${otpCode} sent to ${email}`);

      // 5. Giả lập xác thực OTP
      const isOtpValid = true; // Thay bằng logic kiểm tra OTP thực tế
      if (!isOtpValid) {
        throw new Error("Invalid or expired OTP");
      }

      // 6. Cập nhật số dư và lịch sử giao dịch của người dùng
      await db.collection('users').updateOne(
        { username: payerUsername },
        {
          $inc: { balance: -amount },
          $push: {
            transactionHistory: {
              transactionId: new ObjectId(),
              studentId,
              amount,
              date: new Date(),
              status: "success"
            }
          }
        },
        { session }
      );

      // 7. Cập nhật trạng thái thanh toán của sinh viên
      await db.collection('students').updateOne(
        { studentId },
        { $set: { isPaid: true, lockedBy: null } },
        { session }
      );

      // 8. Lưu giao dịch
      await db.collection('transactions').insertOne({
        payerId: user._id,
        studentId,
        amount,
        date: new Date(),
        status: "success",
        otp: { code: otpCode, issuedAt, expiresAt }
      }, { session });

      // Giả lập gửi email xác nhận
      console.log(`Transaction confirmation sent to ${email}`);
    });

    console.log("Transaction completed successfully");
  } catch (error) {
    console.error("Transaction failed:", error.message);
    throw error;
  } finally {
    await session.endSession();
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

// Ví dụ gọi hàm: hoangnhat thanh toán cho sinh viên 522H0133
processTuitionPayment(
  "hoangnhat",
  "522H0133",
  "nhnhat202@gmail.com"
).catch(console.error);