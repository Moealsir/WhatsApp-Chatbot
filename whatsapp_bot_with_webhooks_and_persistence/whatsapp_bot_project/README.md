# WhatsApp Bot with Webhook Integration

This project is a multi-session WhatsApp bot built with Node.js and WhatsApp Web.js, now enhanced with webhook functionality to send payloads to n8n when any session receives a message.

## 🚀 New Features Added

### Webhook Integration
- **Automatic webhook triggers** when any session receives a message
- **Configurable webhook URLs** via environment variables or frontend settings
- **Comprehensive payload** including session ID, message content, sender info, and full message details
- **Error handling** to prevent bot crashes on webhook failures
- **Delivery logging** to track webhook success/failure rates
- **Test functionality** to verify webhook endpoints

## 📋 Webhook Payload Structure

When a message is received, the following payload is sent to configured webhook URLs:

```json
{
  "sessionId": "session_123",
  "message": "text of the incoming message",
  "from": "whatsapp_number_of_sender",
  "to": "whatsapp_number_of_this_session",
  "messageDetails": {
    "id": "message_id",
    "type": "chat",
    "timestamp": 1234567890,
    "body": "message text",
    "hasMedia": false,
    "isForwarded": false,
    "isStatus": false,
    "isStarred": false,
    "broadcast": false,
    "fromMe": false,
    "hasQuotedMsg": false,
    "deviceType": "web",
    "isGif": false,
    "vCards": [],
    "mentionedIds": [],
    "groupMentions": [],
    "links": []
  }
}
```

## ⚙️ Configuration

### Environment Variables

Add the following to your `.env` file in the backend directory:

```env
WEBHOOK_URLS=https://n8n.msuliman.tech/webhook-test/dental-message-received,https://n8n.msuliman.tech/webhook/dental-message-received
```

**Note:** Multiple URLs can be separated by commas. If `WEBHOOK_URLS` is not set, the default URLs will be used.

### Frontend Configuration

Access the webhook settings page at `http://localhost:3000/webhook` to:
- Add/remove webhook URLs
- Test webhook endpoints
- View delivery logs
- Clear delivery history

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm run build
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📡 API Endpoints

### Webhook Management
- `GET /api/webhook/settings` - Get current webhook settings
- `POST /api/webhook/settings` - Update webhook settings
- `POST /api/webhook/test` - Test a webhook URL
- `GET /api/webhook/logs` - Get delivery logs
- `DELETE /api/webhook/logs` - Clear delivery logs

### Example API Usage

#### Get Webhook Settings
```bash
curl http://localhost:3001/api/webhook/settings
```

#### Update Webhook Settings
```bash
curl -X POST http://localhost:3001/api/webhook/settings \
  -H "Content-Type: application/json" \
  -d '{"webhookUrls": ["https://your-webhook-url.com/endpoint"]}'
```

#### Test Webhook
```bash
curl -X POST http://localhost:3001/api/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-webhook-url.com/endpoint"}'
```

## 🔧 Technical Implementation

### Backend Changes
1. **WebhookService** - Handles webhook delivery and logging
2. **WebhookController** - API endpoints for webhook management
3. **WhatsAppService** - Enhanced with message event handlers
4. **Configuration** - Added webhook URL management

### Frontend Changes
1. **Webhook Settings Page** - Complete UI for webhook management
2. **API Integration** - Updated API utility with webhook methods
3. **Navigation** - Added webhook links to main navigation

### Key Features
- **Asynchronous delivery** - Webhooks don't block message processing
- **Error resilience** - Failed webhooks are logged but don't crash the bot
- **Multiple URLs** - Support for sending to multiple webhook endpoints
- **Delivery tracking** - Comprehensive logging of all webhook attempts
- **Test functionality** - Built-in webhook testing capabilities

## 🚦 Usage

1. **Start the backend server**:
   ```bash
   cd backend && npm run dev
   ```

2. **Start the frontend**:
   ```bash
   cd frontend && npm run dev
   ```

3. **Configure webhooks**:
   - Visit `http://localhost:3000/webhook`
   - Add your webhook URLs
   - Test the endpoints
   - Save settings

4. **Create WhatsApp sessions**:
   - Visit `http://localhost:3000/setup`
   - Create new sessions and scan QR codes

5. **Receive messages**:
   - When messages are received by any session, webhooks will be triggered automatically
   - Check the delivery logs in the webhook settings page

## 🔍 Monitoring

### Delivery Logs
The webhook settings page shows:
- Timestamp of each delivery attempt
- Target URL
- Success/failure status
- Response time
- Error messages (if any)

### Health Checks
- Backend health: `http://localhost:3001/api/health`
- Frontend: `http://localhost:3000`

## 🛡️ Error Handling

- **Network failures** - Logged but don't affect bot operation
- **Invalid URLs** - Validated before saving
- **Timeout handling** - 10-second timeout for webhook requests
- **Graceful degradation** - Bot continues working even if all webhooks fail

## 📝 Notes

- Webhooks are only triggered for incoming messages (not outgoing)
- The bot filters out messages sent by itself (`fromMe: false`)
- Webhook delivery is asynchronous and non-blocking
- All webhook attempts are logged for debugging purposes
- The system supports multiple webhook URLs for redundancy

## 🔗 Default Webhook URLs

The system comes pre-configured with these default webhook URLs:
- `https://n8n.msuliman.tech/webhook-test/dental-message-received`
- `https://n8n.msuliman.tech/webhook/dental-message-received`

These can be modified through the frontend interface or environment variables.

