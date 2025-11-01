# Hướng dẫn Xây dựng, Vận hành & Đánh giá dự án iBanking

1. Hướng dẫn Xây dựng & Vận hành
Bước 1: Cài đặt môi trường
- Node.js ≥ 16  
- npm ≥ 8  
- MongoDB ≥ 7.0 (cài bản Community)
Bước 2: Khởi động MongoDB (replica set)
mkdir -p %USERPROFILE%\mongodb\replica\data
"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --replSet rs0 --dbpath "%USERPROFILE%\mongodb\replica\data" --bind_ip localhost
Khởi tạo replica set (chỉ 1 lần):
Mở mongosh
Gõ: rs.initiate()
Bước 3: Cài đặt dependencies
cd D:\Nam_4_2025-2026\SOA\MIDTERM\ibanking
npm install
cd frontend
npm install
Bước 4: Tạo cơ sở dữ liệu & dữ liệu mẫu
node mongodb_setup.js
Tạo database iBanking với:
users
students
otps (TTL 5 phút)
transactions
Bước 5: Cấu hình Gmail (App Password)
1. Bật 2-Step Verification cho nhnhat202@gmail.com
2. Tạo App Password tại: https://myaccount.google.com/apppasswords
→ Chọn Mail → Other → nhập iBanking → lấy 16 ký tự
3. Sửa file src/routes/api.js:
const EMAIL_USER = 'nhnhat202@gmail.com';
const EMAIL_PASS = 'zlzu xsbu qrfz powu'; 
Bước 6: Chạy ứng dụng
Terminal 1: Backend
node server.js
http://localhost:3000
Terminal 2: Frontend
cd frontend
npm start
http://localhost:3001


2. Thông tin Đăng nhập & URL
Frontend URL: http://localhost:3001
Backend API: http://localhost:3000/api
Tài khoản đăng nhập (đã có sẵn)
hoangnhat,123456,"10,000,000"
thanhsang,123456,"5,000,000"
Sinh viên mẫu
522H0133,"5,000,000"
522H0110,"7,000,000"


3. Ghi chú quan trọng để Giáo viên tái hiện
Replica set: Bắt buộc rs0 để kết nối
App Password: Phải tạo mới nếu hết hạn
OTP: Hiệu lực 5 phút – quá hạn thì gọi lại /api/payment
Khóa giao dịch: Tự động mở sau 5 phút nếu treo
Hard-code email: Chỉ dùng trong dev – không commit file api.js
Kiểm tra DB: Dùng mongosh → use iBanking → db.users.find()


4. API Endpoints
POST, /api/login, Đăng nhập, { username, password }
GET, /api/student/:studentId, Lấy thông tin sinh viên, studentId trong path
POST, /api/payment, Gửi OTP, { payerUsername, studentId, email }
POST, /api/confirm-payment, Xác nhận thanh toán, { transactionId, otpCode, payerUsername, studentId }