// File: mongodb_setup.js
// Hướng dẫn thiết lập cơ sở dữ liệu MongoDB cho ứng dụng thanh toán học phí
// Sử dụng MongoDB Node.js driver để thực hiện các thao tác

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// Kết nối tới MongoDB
const uri = "mongodb://localhost:27017"; // Thay đổi URI nếu cần
const client = new MongoClient(uri);

async function setupDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("iBanking"); // Tên database

    // 1. Tạo collection 'users'
    const usersCollection = await db.createCollection("users");
    console.log("Created collection: users");

    // Tạo index duy nhất cho username và email
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log("Created indexes for users collection");

    // Hash mật khẩu cho dữ liệu mẫu
    const saltRounds = 10;
    const hashedPassword1 = await bcrypt.hash("123456", saltRounds);
    const hashedPassword2 = await bcrypt.hash("123456", saltRounds);

    // Chèn dữ liệu mẫu cho users
    await usersCollection.insertMany([
      {
        username: "hoangnhat",
        password: hashedPassword1,
        fullName: "Nguyễn Hoàng Nhật",
        phoneNumber: "0123456789",
        email: "nhnhat202@gmail.com",
        balance: 10000000,
        transactionHistory: []
      },
      {
        username: "thanhsang",
        password: hashedPassword2,
        fullName: "Nguyễn Thanh Sang",
        phoneNumber: "0987654321",
        email: "locwwe1@gmail.com",
        balance: 5000000,
        transactionHistory: []
      }
    ]);
    console.log("Inserted sample data into users collection");

    // 2. Tạo collection 'students'
    const studentsCollection = await db.createCollection("students");
    console.log("Created collection: students");

    // Tạo index duy nhất cho studentId
    await studentsCollection.createIndex({ studentId: 1 }, { unique: true });
    console.log("Created index for students collection");

    // Chèn dữ liệu mẫu cho students
    await studentsCollection.insertMany([
      {
        studentId: "522H0133",
        fullName: "Nguyễn Nhật Chiêu",
        tuitionAmount: 5000000,
        isPaid: false,
        lockedBy: null
      },
      {
        studentId: "522H0110",
        fullName: "Lê Đức Trung",
        tuitionAmount: 7000000,
        isPaid: false,
        lockedBy: null
      }
    ]);
    console.log("Inserted sample data into students collection");

    // 3. Tạo collection 'transactions'
    const transactionsCollection = await db.createCollection("transactions");
    console.log("Created collection: transactions");

    // 4. Tạo collection 'otps'
    const otpsCollection = await db.createCollection("otps");
    console.log("Created collection: otps");

    // Tạo index duy nhất cho code
    await otpsCollection.createIndex({ code: 1 }, { unique: true });
    console.log("Created index for otps collection");

    // Tạo TTL index cho otps để tự động xóa OTP hết hạn sau 5 phút
    await otpsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    console.log("Created TTL index for otps collection");

  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

// Chạy hàm thiết lập
setupDatabase().catch(console.error);