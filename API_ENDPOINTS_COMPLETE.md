# 📡 HealthAI App - Complete API Endpoints Reference

## Base URL
```
Production: https://api.healthai.com/v1
Staging: https://staging-api.healthai.com/v1
Local: http://localhost:8080/v1
```

---

## 🔐 Authentication Service (Port: 8081)

### POST /auth/register
Đăng ký tài khoản mới

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "0987654321",
  "password": "SecurePass123!",
  "fullName": "Nguyen Van A",
  "dob": "1990-01-15",
  "address": "123 Street, HCMC",
  "acceptTerms": true
}
```

**Response: 200 OK**
```json
{
  "message": "OTP sent to your phone",
  "otpToken": "uuid-token",
  "expiresIn": 300
}
```

### POST /auth/otp/verify
Xác thực OTP code

### POST /auth/login
Đăng nhập

### POST /auth/refresh
Làm mới access token

### POST /auth/logout
Đăng xuất

### POST /auth/forgot-password
Quên mật khẩu

### POST /auth/reset-password
Đặt lại mật khẩu

---

## 👤 User Service (Port: 8082)

### GET /users/profile
Lấy thông tin profile

### PUT /users/profile
Cập nhật profile

### POST /users/vital-signs
Thêm chỉ số sức khỏe

### GET /users/vital-signs/history
Lịch sử chỉ số sức khỏe

### POST /users/avatar/upload
Upload avatar

### GET /users/medical-history
Lịch sử bệnh

### POST /users/medical-history
Thêm bệnh vào lịch sử

---

## 🤖 AI Diagnosis Service (Port: 5000)

### POST /ai/chat
Chẩn đoán AI từ triệu chứng

### GET /ai/diagnosis/history
Lịch sử chẩn đoán

### GET /ai/diagnosis/{id}
Chi tiết 1 chẩn đoán

### POST /ai/feedback
Đánh giá chẩn đoán AI

---

## 📅 Appointment Service (Port: 8083)

### GET /appointments/doctors
Tìm kiếm bác sĩ

### POST /appointments/book
Đặt lịch hẹn

### GET /appointments/my-appointments
Danh sách lịch hẹn

### GET /appointments/{id}
Chi tiết lịch hẹn

### PUT /appointments/{id}/cancel
Hủy lịch hẹn

### PUT /appointments/{id}/reschedule
Đổi lịch hẹn

### POST /appointments/{id}/complete
Hoàn thành khám

---

## 💊 Pharmacy/Store Service (Port: 8085)

### GET /products
Danh sách sản phẩm thuốc

### GET /products/{id}
Chi tiết sản phẩm

### POST /cart/add
Thêm vào giỏ hàng

### GET /cart
Xem giỏ hàng

### DELETE /cart/{itemId}
Xóa item khỏi giỏ

### POST /orders/create
Tạo đơn hàng

### GET /orders
Danh sách đơn hàng

### GET /orders/{id}
Chi tiết đơn hàng

### PUT /orders/{id}/cancel
Hủy đơn hàng

---

## 💳 Payment Service (Port: 8084)

### POST /payments/vnpay/create
Tạo link thanh toán VNPAY

### GET /payments/{transactionId}/status
Kiểm tra trạng thái thanh toán

### GET /payments/history
Lịch sử giao dịch

### POST /payments/refund
Hoàn tiền

---

## 📍 Location/Hospital Service (Port: 8086)

### GET /hospitals/nearby
Tìm bệnh viện gần nhất

### GET /hospitals/{id}
Chi tiết bệnh viện

### GET /hospitals/{id}/doctors
Bác sĩ tại bệnh viện

---

## � Chat & Video Call Service (Port: 8089)

### POST /chat/conversations/create
Tạo cuộc trò chuyện mới với bác sĩ

### GET /chat/conversations
Danh sách cuộc trò chuyện

### GET /chat/conversations/{id}/messages
Lấy tin nhắn trong cuộc trò chuyện

### POST /chat/messages/send
Gửi tin nhắn văn bản

### POST /chat/messages/upload
Upload file/hình ảnh trong chat

### PUT /chat/messages/{id}/read
Đánh dấu đã đọc tin nhắn

### POST /video-call/create-room
Tạo phòng video call

### GET /video-call/rooms/{id}/token
Lấy access token cho video call

### POST /video-call/rooms/{id}/join
Tham gia phòng video call

### PUT /video-call/rooms/{id}/end
Kết thúc video call

### GET /video-call/history
Lịch sử các cuộc gọi

---

## �🔔 Notification Service (Port: 8087)

### GET /notifications
Danh sách thông báo

### PUT /notifications/{id}/read
Đánh dấu đã đọc

### DELETE /notifications/{id}
Xóa thông báo

### POST /notifications/settings
Cài đặt thông báo

---

## 🛡️ Admin Service (Port: 8088)

### GET /admin/users
Quản lý users

### GET /admin/statistics
Thống kê hệ thống

### GET /admin/logs
Xem logs

### POST /admin/products
Thêm sản phẩm

### PUT /admin/doctors/{id}/verify
Duyệt bác sĩ

---

## 📊 Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service down |

---

**Total API Endpoints:** 50+  
**Version:** 1.0.0  
**Last Updated:** October 28, 2025
