# MCP Server with AuthKit Integration

A comprehensive Model Context Protocol (MCP) server built on Cloudflare Workers that integrates with WorkOS AuthKit for authentication and provides automated calendar management, appointment scheduling, email notifications, and report retrieval capabilities.

## 🌟 Features

### Core Functionality
- **OAuth Authentication**: Secure authentication flow using WorkOS AuthKit
- **Google Calendar Integration**: Full calendar management with Asia/Kolkata timezone support
- **Automated Reminders**: Background service that sends email reminders 30 minutes before meetings
- **Email Notifications**: Automated appointment confirmations and reminders via Gmail API
- **Report Management**: Retrieve user reports by contact information

### Available Tools

#### 📅 Appointment Management
- **scheduleAppointment**: Create new appointments with comprehensive user information
- **cancelAppointment**: Cancel existing appointments by title, date, or user info
- **rescheduleAppointment**: Move appointments to new dates/times
- **getUserAppointments**: Retrieve upcoming appointments for specific users
- **recommendAppointmentTimes**: Find available 45-minute time slots on specific dates

#### 📧 Email Tools
- **sendAppointmentEmail**: Send appointment confirmation emails with meeting details

#### 📊 Report Tools
- **get_report_by_contact**: Retrieve user reports using phone number or email
- **test_api_directly**: Diagnostic tool for testing API endpoints

#### 🕐 Utility Tools
- **getCurrentDate**: Get current UTC date in YYYY-MM-DD format

## 🏗️ Project Structure

```
.
├── src/
│   ├── automation/
│   │   └── calendarreminder.ts      # Automated reminder service
│   ├── tools/
│   │   ├── appointment.ts            # Shared appointment utilities
│   │   ├── cancelAppointmentTool.ts  # Cancel appointment tool
│   │   ├── date.ts                   # Date utility tool
│   │   ├── getUserAppointmentsTool.ts # Get user appointments
│   │   ├── mail.ts                   # Email utilities and tools
│   │   ├── recommendAppointmentTimesTool.ts # Availability checker
│   │   ├── report.ts                 # Report retrieval tools
│   │   ├── rescheduleAppointmentTool.ts # Reschedule appointments
│   │   └── scheduleAppointmentTool.ts # Schedule new appointments
│   ├── authkit-handler.ts            # OAuth authorization flow
│   ├── index.ts                      # Main entry point and server setup
│   └── props.ts                      # TypeScript type definitions
├── .dev.vars.example                 # Example environment variables
├── .gitignore                        # Git ignore rules
├── README.md                         # This file
├── biome.json                        # Biome configuration
├── package.json                      # Node.js dependencies
└── package-lock.json                 # Locked dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Cloudflare Workers account
- WorkOS account with AuthKit configured
- Google Cloud project with Calendar and Gmail API enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.dev.vars` file based on `.dev.vars.example`:
   ```bash
   cp .dev.vars.example .dev.vars
   ```

   Required environment variables:
   ```env
   WORKOS_CLIENT_ID=your_workos_client_id
   WORKOS_CLIENT_SECRET=your_workos_client_secret
   GOOGLE_ACCESS_TOKEN=your_google_oauth_token
   ```

4. **Configure Cloudflare Worker**
   
   Update your `wrangler.jsonc` (or `wrangler.toml`) with:
   - KV namespace bindings
   - Durable Object bindings
   - Environment-specific settings

### Development

Run the development server locally:
```bash
npm run dev
```

The server will start on `http://localhost:8787` (or your configured port).

### Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

Or use Wrangler directly:
```bash
npx wrangler deploy
```

## 🔧 Configuration

### Google Calendar & Gmail Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one

2. **Enable Required APIs**
   - Google Calendar API
   - Gmail API

3. **Create OAuth 2.0 Credentials**
   - Navigate to "APIs & Services" > "Credentials"
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs

4. **Generate Access Token**
   - Use OAuth 2.0 Playground or your own flow
   - Required scopes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/gmail.send`
   - Add token to `.dev.vars` as `GOOGLE_ACCESS_TOKEN`

### WorkOS AuthKit Setup

1. **Create WorkOS Account**
   - Sign up at [workos.com](https://workos.com)
   - Navigate to AuthKit section

2. **Configure Application**
   - Create a new AuthKit application
   - Set redirect URIs to match your deployment:
     ```
     http://localhost:8787/callback (for development)
     https://your-worker.workers.dev/callback (for production)
     ```

3. **Get Credentials**
   - Copy Client ID and Client Secret
   - Add to `.dev.vars`:
     ```env
     WORKOS_CLIENT_ID=client_xxx
     WORKOS_CLIENT_SECRET=sk_xxx
     ```

### Cloudflare Workers Setup

1. **Create KV Namespace**
   ```bash
   wrangler kv:namespace create "OAUTH_KV"
   wrangler kv:namespace create "OAUTH_KV" --preview
   ```

2. **Create Durable Object**
   - Ensure `MCP_OBJECT` is properly configured in `wrangler.jsonc`

3. **Add Bindings**
   Update your `wrangler.jsonc`:
   ```json
   {
     "kv_namespaces": [
       {
         "binding": "OAUTH_KV",
         "id": "your-kv-namespace-id"
       }
     ],
     "durable_objects": {
       "bindings": [
         {
           "name": "MCP_OBJECT",
           "class_name": "MyMCP"
         }
       ]
     }
   }
   ```

## 📋 API Reference

### Appointment Scheduling

**Schedule an Appointment**
```typescript
scheduleAppointment({
  userName: "John Doe",
  userEmail: "john@example.com",
  userPhone: "+911234567890",
  summary: "Product Consultation",
  description: "Discuss new features",
  appointmentType: "online", // or "offline"
  date: "tomorrow",
  startTime: "10:00",
  attendees: ["jane@example.com"],
  checkAvailability: true,
  sendReminder: true
})
```

**Recommend Available Times**
```typescript
recommendAppointmentTimes({
  date: "2024-11-15" // or "tomorrow", "next week"
})
```

**Cancel an Appointment**
```typescript
cancelAppointment({
  summary: "Product Consultation",
  date: "2024-10-26",
  userName: "John Doe",
  userEmail: "john@example.com",
  exactMatch: false
})
```

**Reschedule an Appointment**
```typescript
rescheduleAppointment({
  summary: "Product Consultation",
  currentDate: "2024-10-26",
  userEmail: "john@example.com",
  newDate: "next week",
  newStartTime: "14:00",
  newSummary: "Product Demo", // optional
  checkAvailability: true,
  forceProceed: true
})
```

**Get User Appointments**
```typescript
getUserAppointments({
  userName: "John Doe",
  userEmail: "john@example.com",
  userPhone: "+911234567890"
})
```

### Report Retrieval

**Get Reports by Contact**
```typescript
get_report_by_contact({
  phone: "+911234567890",
  email: "john@example.com",
  limit: 10
})
```

### Date Expressions

The system supports natural language date expressions:
- `"today"` - Current date
- `"tomorrow"` - Next day
- `"yesterday"` - Previous day
- `"10 days from now"` - Date 10 days ahead
- `"in 5 days"` - Date 5 days ahead
- `"5 days ago"` - Date 5 days back
- `"next week"` - Date 7 days ahead
- `"next month"` - Date 1 month ahead
- `"YYYY-MM-DD"` - Specific date (e.g., "2024-12-25")

## 🤖 Automated Features

### Calendar Reminder Service

The background reminder service automatically:
- **Checks** for upcoming meetings every 2 minutes
- **Sends** email reminders 30 minutes before meetings (±5 minute window)
- **Tracks** sent reminders using KV storage to avoid duplicates
- **Handles** declined attendees appropriately
- **Formats** emails with meeting details and timing

Configuration constants:
```typescript
REMINDER_MINUTES = 30        // Send reminder 30 min before
CHECK_INTERVAL_MS = 120000   // Check every 2 minutes
```

The service starts automatically when the worker initializes and runs continuously in the background.

## 🔒 Security

- **OAuth 2.0 Authentication**: Via WorkOS AuthKit
- **Secure Token Management**: Stored in Cloudflare KV with encryption
- **Environment-based Secrets**: No hardcoded credentials
- **Permissions-based Access**: Scoped API access tokens
- **Input Validation**: Zod schema validation on all tool inputs

## 🛠️ Development

### Type Safety
- Full TypeScript support with strict mode
- Zod schema validation for runtime type checking
- Comprehensive type definitions in `props.ts`

### Code Quality
- **Biome** for linting and formatting
- Configured in `biome.json`
- Run checks:
  ```bash
  npm run lint
  npm run format
  ```

### Testing
```bash
# Test locally
npm run dev

# Test specific endpoints
curl http://localhost:8787/authorize
```

## 📝 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `WORKOS_CLIENT_ID` | WorkOS client identifier | Yes | `client_xxx` |
| `WORKOS_CLIENT_SECRET` | WorkOS secret key | Yes | `sk_xxx` |
| `GOOGLE_ACCESS_TOKEN` | Google OAuth access token | Yes | `ya29.xxx` |

### Setting Secrets in Production

For production deployment, use Wrangler secrets:
```bash
echo "your_secret_value" | wrangler secret put GOOGLE_ACCESS_TOKEN
echo "your_client_secret" | wrangler secret put WORKOS_CLIENT_SECRET
```

## 🌐 Timezone Support

All appointments use **Asia/Kolkata (IST)** timezone by default.

**How it works:**
- User input times are interpreted as IST
- Calendar stores events with proper timezone info
- Display times are shown in IST format
- System handles 5:30 hour offset for UTC conversion

**Time format examples:**
- Input: `"14:30"` (HH:MM, 24-hour format)
- Display: `"02:30 PM IST"`

## 📊 Report API Integration

Connects to external report API (`https://dimt-api.onrender.com/api`):

**Features:**
- Search by phone number or email
- Returns client information and report history
- Includes report metadata, file paths, and timestamps
- Supports pagination with configurable limits

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting and type checks (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Coding Standards
- Follow TypeScript best practices
- Use Biome for formatting
- Add JSDoc comments for public functions
- Include error handling for all API calls

## 🐛 Troubleshooting

### Common Issues

**Authentication Errors**
```
Error: Invalid client credentials
```
- ✅ Verify WorkOS credentials in `.dev.vars`
- ✅ Check redirect URIs match exactly
- ✅ Ensure callback endpoint is accessible

**Calendar API Errors**
```
Error: Google Calendar API error: 401
```
- ✅ Confirm Google Calendar API is enabled
- ✅ Verify access token is valid and not expired
- ✅ Check token has correct scopes
- ✅ Regenerate token if necessary

**Email Sending Failures**
```
Error: Gmail API error: 403
```
- ✅ Ensure Gmail API is enabled in Google Cloud
- ✅ Verify access token has `gmail.send` scope
- ✅ Check email formatting is correct
- ✅ Verify sender email is authorized

**Time Slot Conflicts**
```
Warning: Time slot unavailable
```
- ✅ Use `recommendAppointmentTimes` to find free slots
- ✅ Check for existing appointments
- ✅ Consider 15-minute buffer between meetings

**KV Storage Issues**
```
Error: KV namespace not found
```
- ✅ Create KV namespace with Wrangler
- ✅ Update namespace ID in `wrangler.jsonc`
- ✅ Deploy with updated configuration

### Debug Mode

Enable verbose logging in development:
```typescript
// In index.ts
console.log("Debug info:", { env, props, request });
```

Check Cloudflare Workers logs:
```bash
wrangler tail
```

## 📞 Support

For issues or questions:
- 🐛 [Open an issue](https://github.com/your-repo/issues)
- 📖 Check the [documentation](https://github.com/your-repo/wiki)
- 💬 Join our [Discord community](#)
- 📧 Email: support@yourproject.com

## 🔄 Version History

### v1.0.0 - Initial Release
- ✅ OAuth authentication with WorkOS AuthKit
- ✅ Google Calendar integration
- ✅ Appointment scheduling, cancellation, rescheduling
- ✅ Automated email reminders
- ✅ Report retrieval system
- ✅ Natural language date parsing
- ✅ Timezone support (IST)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [WorkOS](https://workos.com) for AuthKit integration
- [Cloudflare Workers](https://workers.cloudflare.com) for serverless infrastructure
- [Model Context Protocol](https://modelcontextprotocol.io) for MCP framework
- Google Calendar & Gmail APIs for calendar and email functionality

---

**Built with ❤️ using Cloudflare Workers, WorkOS AuthKit, and Model Context Protocol**

*For the latest updates and documentation, visit [your-project-url]*
