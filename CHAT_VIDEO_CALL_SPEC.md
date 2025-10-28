# 💬 Chat & Video Call System - Technical Specification

## 📋 Overview
Hệ thống Chat trực tuyến và Video Call cho phép bệnh nhân trao đổi với bác sĩ qua tin nhắn văn bản, chia sẻ file, và gọi video trực tiếp.

---

## 🏗️ Architecture

### Technology Stack
- **Chat Backend:** Spring Boot + WebSocket (Socket.IO or Spring WebSocket)
- **Video Call:** WebRTC + Jitsi Meet (hoặc Agora.io)
- **Real-time:** Redis PubSub for horizontal scaling
- **Message Queue:** RabbitMQ for asynchronous processing
- **File Storage:** AWS S3 / MinIO
- **Database:** PostgreSQL (messages, rooms) + MongoDB (chat history archive)

### Infrastructure
```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (Nginx)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌──────────────────┐        ┌──────────────────┐
│ WebSocket Server │        │ WebSocket Server │
│ (Node 1)         │        │ (Node 2)         │
└────────┬─────────┘        └─────────┬────────┘
         │                            │
         └────────────┬───────────────┘
                      ▼
              ┌─────────────┐
              │ Redis PubSub│ (for scaling WebSocket)
              └─────────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │Chat API │  │Video API│  │File API │
   │Service  │  │Service  │  │Service  │
   └────┬────┘  └────┬────┘  └────┬────┘
        │            │            │
        └────────────┼────────────┘
                     ▼
             ┌──────────────┐
             │ PostgreSQL   │
             │ + MongoDB    │
             └──────────────┘
```

---

## 📡 API Endpoints

### Chat APIs (Port: 8089)

#### 1. Create Conversation
```http
POST /api/v1/chat/conversations/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctorId": "doctor-uuid",
  "appointmentId": "appointment-uuid",
  "initialMessage": "Xin chào bác sĩ..."
}

Response 201:
{
  "conversationId": "conv-uuid",
  "doctorName": "BS. Nguyen Van A",
  "status": "ACTIVE",
  "createdAt": "2025-10-28T14:30:00Z"
}
```

#### 2. Get Conversations List
```http
GET /api/v1/chat/conversations?status=ACTIVE&page=1&limit=20
Authorization: Bearer <token>

Response 200:
{
  "total": 15,
  "conversations": [
    {
      "id": "conv-uuid",
      "doctorName": "BS. Nguyen Van A",
      "lastMessage": {
        "content": "Bạn nên uống thuốc sau bữa ăn",
        "sentAt": "2025-10-28T15:45:00Z",
        "isRead": false
      },
      "unreadCount": 3
    }
  ]
}
```

#### 3. Get Messages
```http
GET /api/v1/chat/conversations/{conversationId}/messages?before=timestamp&limit=50
Authorization: Bearer <token>

Response 200:
{
  "messages": [
    {
      "id": "msg-uuid",
      "senderId": "user-uuid",
      "senderType": "PATIENT",
      "content": "Tôi bị đau đầu",
      "contentType": "TEXT",
      "sentAt": "2025-10-28T14:30:00Z",
      "isRead": true
    }
  ],
  "hasMore": true
}
```

#### 4. Send Message (REST or WebSocket)
```http
POST /api/v1/chat/messages/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": "conv-uuid",
  "content": "Cảm ơn bác sĩ",
  "contentType": "TEXT"
}

Response 201:
{
  "messageId": "msg-uuid",
  "sentAt": "2025-10-28T16:00:00Z",
  "status": "SENT"
}
```

#### 5. Upload File
```http
POST /api/v1/chat/messages/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

conversationId: conv-uuid
file: [binary]
fileType: IMAGE

Response 201:
{
  "messageId": "msg-uuid",
  "fileUrl": "https://cdn.example.com/chat-files/abc123.jpg",
  "fileName": "xray-result.jpg",
  "fileSize": 1024567
}
```

### Video Call APIs

#### 1. Create Room
```http
POST /api/v1/video-call/create-room
Authorization: Bearer <token>
Content-Type: application/json

{
  "appointmentId": "appointment-uuid",
  "scheduledTime": "2025-10-28T17:00:00Z",
  "duration": 30
}

Response 201:
{
  "roomId": "room-uuid",
  "roomName": "consultation-12345",
  "joinUrl": "https://meet.healthai.com/room-uuid",
  "hostToken": "eyJhbGc...",
  "guestToken": "eyJhbGc...",
  "expiresAt": "2025-10-28T17:30:00Z"
}
```

#### 2. Get Room Token
```http
GET /api/v1/video-call/rooms/{roomId}/token
Authorization: Bearer <token>

Response 200:
{
  "accessToken": "eyJhbGc...",
  "joinUrl": "https://meet.healthai.com/room-uuid?token=...",
  "configuration": {
    "stunServers": ["stun:stun.l.google.com:19302"],
    "turnServers": [{
      "urls": "turn:turn.healthai.com:3478",
      "username": "user123",
      "credential": "pass456"
    }]
  }
}
```

#### 3. Join Room
```http
POST /api/v1/video-call/rooms/{roomId}/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceInfo": {
    "browser": "Chrome 118.0",
    "hasCamera": true,
    "hasMicrophone": true
  }
}

Response 200:
{
  "participants": [
    {
      "userId": "user-uuid",
      "name": "Nguyen Van A",
      "role": "PATIENT",
      "isVideoOn": true,
      "isAudioOn": true
    }
  ],
  "status": "IN_PROGRESS"
}
```

#### 4. End Call
```http
PUT /api/v1/video-call/rooms/{roomId}/end
Authorization: Bearer <token>

Response 200:
{
  "duration": 1850,
  "recording": {
    "available": true,
    "url": "https://cdn.example.com/recordings/room-uuid.mp4"
  }
}
```

---

## 🗄️ Database Schema

### Table: conversations
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    appointment_id UUID REFERENCES appointments(id),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'CLOSED')),
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_doctor_id ON conversations(doctor_id);
CREATE INDEX idx_conversations_status ON conversations(status);
```

### Table: chat_messages
```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    sender_type VARCHAR(10) CHECK (sender_type IN ('PATIENT', 'DOCTOR')),
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'TEXT' CHECK (content_type IN ('TEXT', 'IMAGE', 'FILE', 'AUDIO', 'VIDEO')),
    file_name VARCHAR(255),
    file_size INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_messages_sent_at ON chat_messages(sent_at DESC);
CREATE INDEX idx_messages_unread ON chat_messages(conversation_id, is_read) WHERE is_read = FALSE;
```

### Table: video_call_rooms
```sql
CREATE TABLE video_call_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_name VARCHAR(100) UNIQUE NOT NULL,
    appointment_id UUID REFERENCES appointments(id),
    conversation_id UUID REFERENCES conversations(id),
    host_id UUID NOT NULL REFERENCES users(id),
    guest_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'IN_PROGRESS', 'ENDED', 'CANCELLED')),
    scheduled_time TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    duration INTEGER,
    recording_url VARCHAR(500),
    has_recording BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_video_rooms_host_id ON video_call_rooms(host_id);
CREATE INDEX idx_video_rooms_guest_id ON video_call_rooms(guest_id);
CREATE INDEX idx_video_rooms_status ON video_call_rooms(status);
```

---

## 🔌 WebSocket Events

### Client → Server Events
```javascript
// Connect to WebSocket
const socket = io('wss://api.healthai.com/ws/chat', {
  auth: {
    token: 'Bearer <JWT_TOKEN>'
  }
});

// Join conversation
socket.emit('join_conversation', {
  conversationId: 'conv-uuid'
});

// Send message
socket.emit('send_message', {
  conversationId: 'conv-uuid',
  content: 'Hello doctor',
  contentType: 'TEXT'
});

// Typing indicator
socket.emit('typing_start', { conversationId: 'conv-uuid' });
socket.emit('typing_stop', { conversationId: 'conv-uuid' });

// Mark as read
socket.emit('mark_read', { messageId: 'msg-uuid' });
```

### Server → Client Events
```javascript
// New message received
socket.on('message_received', (data) => {
  console.log(data);
  // {
  //   messageId: 'msg-uuid',
  //   senderId: 'user-uuid',
  //   content: 'Hello',
  //   sentAt: '2025-10-28T14:30:00Z'
  // }
});

// Message read
socket.on('message_read', (data) => {
  console.log(data);
  // { messageId: 'msg-uuid', readAt: '2025-10-28T14:32:00Z' }
});

// Typing indicator
socket.on('typing_start', (data) => {
  console.log(data);
  // { userId: 'doctor-uuid', userName: 'BS. Nguyen Van A' }
});

// Incoming video call
socket.on('call_incoming', (data) => {
  console.log(data);
  // {
  //   roomId: 'room-uuid',
  //   callerName: 'BS. Nguyen Van A',
  //   joinUrl: 'https://meet.healthai.com/room-uuid'
  // }
});

// Call started
socket.on('call_started', (data) => {
  console.log(data);
  // { roomId: 'room-uuid', startedAt: '2025-10-28T17:00:00Z' }
});

// Call ended
socket.on('call_ended', (data) => {
  console.log(data);
  // { roomId: 'room-uuid', duration: 1850, endedAt: '2025-10-28T17:30:50Z' }
});

// Participant joined/left
socket.on('participant_joined', (data) => {
  console.log(data);
  // { userId: 'user-uuid', userName: 'Nguyen Van A', role: 'PATIENT' }
});
```

---

## 🎥 WebRTC Implementation

### Frontend (React/Flutter)
```javascript
// Initialize WebRTC
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:turn.healthai.com:3478',
      username: 'user123',
      credential: 'pass456'
    }
  ]
});

// Get local media stream
const localStream = await navigator.mediaDevices.getUserMedia({
  video: { width: 1280, height: 720 },
  audio: {
    echoCancellation: true,
    noiseSuppression: true
  }
});

// Add local tracks to peer connection
localStream.getTracks().forEach(track => {
  peerConnection.addTrack(track, localStream);
});

// Handle remote stream
peerConnection.ontrack = (event) => {
  const remoteVideo = document.getElementById('remote-video');
  remoteVideo.srcObject = event.streams[0];
};

// ICE candidate handling
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit('ice_candidate', {
      roomId: 'room-uuid',
      candidate: event.candidate
    });
  }
};
```

### Using Jitsi Meet (Simpler Alternative)
```javascript
// Load Jitsi Meet API
const domain = 'meet.healthai.com';
const options = {
  roomName: 'consultation-12345',
  jwt: 'eyJhbGc...',
  width: '100%',
  height: 600,
  parentNode: document.getElementById('jitsi-container'),
  configOverwrite: {
    startWithAudioMuted: false,
    startWithVideoMuted: false,
    enableWelcomePage: false
  },
  interfaceConfigOverwrite: {
    TOOLBAR_BUTTONS: [
      'microphone', 'camera', 'closedcaptions', 'desktop',
      'fullscreen', 'hangup', 'settings', 'videoquality'
    ]
  }
};

const api = new JitsiMeetExternalAPI(domain, options);

// Event listeners
api.addEventListener('videoConferenceJoined', () => {
  console.log('User joined the call');
});

api.addEventListener('videoConferenceLeft', () => {
  console.log('User left the call');
});
```

---

## 🔒 Security

### Encryption
- **Transport Layer:** TLS 1.3 for all API calls
- **WebSocket:** WSS (WebSocket Secure)
- **Video Streaming:** DTLS-SRTP for media encryption
- **Messages at Rest:** AES-256 encryption in database
- **File Storage:** Server-side encryption in S3

### Authentication & Authorization
```java
@PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
@GetMapping("/conversations")
public ResponseEntity<List<Conversation>> getConversations() {
    // Only allow users to see their own conversations
    String userId = SecurityContextHolder.getContext().getAuthentication().getName();
    return conversationService.getConversationsByUserId(userId);
}
```

### Rate Limiting
```yaml
rate-limiting:
  chat:
    messages-per-minute: 30
    files-per-hour: 20
  video:
    rooms-per-day: 10
    max-duration-minutes: 60
```

---

## 📊 Performance & Scaling

### Message Throughput
- **Target:** 1000 messages/second
- **Latency:** < 100ms (send to receive)
- **WebSocket Connections:** 10,000+ concurrent

### Video Call Quality
- **Resolution:** 1280x720 @ 30fps
- **Bitrate:** 1.5 Mbps video, 128 Kbps audio
- **Latency:** < 150ms (peer-to-peer)
- **Packet Loss Tolerance:** < 5%

### Horizontal Scaling
```yaml
# Kubernetes Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chat-service
spec:
  replicas: 5
  selector:
    matchLabels:
      app: chat-service
  template:
    spec:
      containers:
      - name: chat-service
        image: healthai/chat-service:latest
        env:
        - name: REDIS_URL
          value: redis://redis-cluster:6379
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
```

---

## 🧪 Testing

### Unit Tests
```java
@Test
public void testSendMessage() {
    Message message = new Message();
    message.setConversationId("conv-uuid");
    message.setContent("Hello");
    
    Message saved = chatService.sendMessage(message);
    
    assertNotNull(saved.getId());
    assertEquals("Hello", saved.getContent());
}
```

### Integration Tests
```java
@Test
public void testWebSocketConnection() {
    StompSession session = stompClient
        .connect("ws://localhost:8089/ws/chat", new StompSessionHandlerAdapter() {})
        .get(1, TimeUnit.SECONDS);
    
    assertTrue(session.isConnected());
}
```

---

## 📈 Monitoring & Metrics

### Key Metrics
- **Message Delivery Rate:** % messages delivered within 1 second
- **WebSocket Connection Uptime:** % time connections are stable
- **Video Call Quality Score:** Based on bitrate, latency, packet loss
- **Active Conversations:** Real-time count
- **Concurrent Video Calls:** Real-time count

### Alerts
```yaml
alerts:
  - name: HighMessageLatency
    condition: message_delivery_time > 2s
    action: notify_oncall
  
  - name: WebSocketConnectionDrop
    condition: active_connections_drop > 20%
    action: restart_service
  
  - name: VideoCallFailure
    condition: call_setup_failure_rate > 10%
    action: check_turn_server
```

---

## 🚀 Deployment Checklist

- [ ] Set up Redis cluster for WebSocket scaling
- [ ] Configure TURN/STUN servers for WebRTC
- [ ] Deploy Jitsi Meet server (or integrate Agora.io)
- [ ] Set up S3 bucket for file storage
- [ ] Configure CDN for file delivery
- [ ] Enable database encryption at rest
- [ ] Set up SSL certificates for WSS
- [ ] Configure rate limiting
- [ ] Set up monitoring dashboards
- [ ] Create incident response playbook

---

**Version:** 1.0.0  
**Last Updated:** October 28, 2025  
**Author:** HealthAI Development Team
