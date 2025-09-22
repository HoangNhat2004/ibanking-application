// File: server.js
     // Khởi động server Express

     const express = require('express');
     const cors = require('cors');
     const apiRoutes = require('./src/routes/api');

     const app = express();
     app.use(cors({ origin: 'http://localhost:3001' }));
     app.use(express.json());

     // Đăng ký routes
     app.use('/api', apiRoutes);
     console.log("Registered routes under /api");

     // Xử lý lỗi 404
     app.use((req, res) => {
       console.log("404 - Route not found:", req.method, req.url);
       res.status(404).json({ success: false, message: "Route not found" });
     });

     // Xử lý lỗi server
     app.use((err, req, res, next) => {
       console.error(err.stack);
       res.status(500).json({ success: false, message: "Server error" });
     });

     // Khởi động server
     const PORT = 3000;
     app.listen(PORT, () => {
       console.log(`Server running on port ${PORT}`);
     });