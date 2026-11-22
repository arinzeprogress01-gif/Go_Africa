# GreenGig Africa API

Express + ES modules backend starter for the two-sided GreenGig Africa marketplace.

## User ends in this MVP
- **Worker**: one account type for paid job seekers and volunteers. `workerType` is `job_seeker` or `volunteer`.
- **Organization**: an organization account that must be manually reviewed before it can post tasks.

This follows the PRD's phone-number/SMS OTP signup. The PRD says no email is required.

## 1. Install and run

```bash
npm install
cp .env.example .env
npm run dev
```

Windows CMD alternative:

```cmd
copy .env.example .env
npm install
npm run dev
```

Health check: `GET http://localhost:5000/api/v1/health`

## 2. SMS OTP setup (Termii)

1. Create/sign in to a Termii account and complete any sender ID/business verification required by Termii.
2. Obtain an API key from the Termii dashboard.
3. Add `TERMII_API_KEY`, `TERMII_SENDER_ID`, and `TERMII_CHANNEL` to `.env`.
4. Use an approved sender ID. If your sender ID is not approved yet, use the sender ID/channel Termii permits for your account.
5. Set `OTP_DEV_RETURN_CODE=false` before deployment.

The API sends an SMS using Termii's send-message endpoint. Phone numbers are normalized to international format. For Nigeria, send `080...` or `+23480...`; the service converts local `0` numbers to `+234...`.

## 3. Authentication endpoints

### Send OTP
`POST /api/v1/auth/otp/send`

Worker:
```json
{ "phone": "08031234567", "accountType": "worker", "workerType": "job_seeker" }
```

Volunteer:
```json
{ "phone": "08031234567", "accountType": "worker", "workerType": "volunteer" }
```

Organization:
```json
{ "phone": "08031234567", "accountType": "organization" }
```

### Verify OTP
`POST /api/v1/auth/otp/verify`

```json
{
  "phone": "08031234567",
  "accountType": "worker",
  "otp": "123456"
}
```

For a worker, include `workerType` in the send request; the verification request can include it too. The API returns a JWT token and user record after successful verification. Keep the token on the frontend and send it as `Authorization: Bearer <token>`.

### Current user
`GET /api/v1/auth/me`
Header: `Authorization: Bearer <token>`

### Example cURL (Windows CMD)
```cmd
curl -X POST http://localhost:5000/api/v1/auth/otp/send -H "Content-Type: application/json" -d "{\"phone\":\"08031234567\",\"accountType\":\"worker\",\"workerType\":\"job_seeker\"}"
```

## 4. Database status

Mongoose models are ready in `src/models`. Set `MONGODB_URI` when your MongoDB database is ready. Until then, the app deliberately uses in-memory repositories so you can deploy and test the SMS flow without waiting for database setup.

**Important:** in-memory OTP/user data is temporary and is not suitable for production or multiple server instances. Configure MongoDB (and preferably Redis for OTP/rate limiting) before real users rely on the service. The Mongoose schemas are already created for `Worker` and `Organization`.

## 5. Deployment (Render)

- Create a new **Web Service** from your GitHub repository.
- Runtime: Node.
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables from `.env` in Render's Environment tab.
- Set `NODE_ENV=production`, a strong `JWT_SECRET`, `TERMII_API_KEY`, `TERMII_SENDER_ID`, and `MONGODB_URI` when ready.
- Do not upload `.env` or commit API keys.
- After deployment test `https://YOUR-SERVICE.onrender.com/api/v1/health`.

## 6. Folder structure

```text
src/
  config/          environment + database connection
  controllers/     HTTP request/response handlers
  middleware/      auth, validation, errors, not-found
  models/          Worker + Organization Mongoose schemas
  repositories/    database/in-memory persistence boundary
  routes/          route definitions
  services/        OTP, SMS, authentication business logic
  utils/           phone, OTP, async handler, API errors
app.js
server.js
```

## Notes
- OTPs are stored as hashes, expire, and have a maximum verification-attempt count.
- OTP resend cooldown and endpoint rate limits are enabled.
- Do not return OTPs in production. `OTP_DEV_RETURN_CODE=true` is only for local development without an SMS provider.
- Organization accounts start with `verificationStatus: "pending"`; enforce this before allowing task creation.
- Do not treat phone OTP verification as proof that an organization is legitimate. The PRD requires manual GreenGig review before organizations can post tasks.
