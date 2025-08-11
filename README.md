Subscription Tracker API
A Node.js + Express + MongoDB backend to track user subscriptions (Netflix, Spotify, etc.), with JWT auth, Arcjet middleware (optional), and Upstash/QStash workflow hook for renewal reminders.

Features
JWT authentication (sign up / sign in)

CRUD for subscriptions

“My subscriptions” endpoint (scoped to authenticated user)

Optional reminder workflow endpoint for Upstash/QStash

Health check

ESM modules, Mongoose models, structured validation

Tech Stack
Node.js 22, Express 4

MongoDB + Mongoose

JSON Web Tokens (jsonwebtoken)

(Optional) Arcjet middleware

(Optional) Upstash QStash workflow endpoint

Getting Started
1) Clone & install
bash
Copy
Edit
git clone https://github.com/<your-username>/Subscription-tracker-API.git
cd Subscription-tracker-API
npm ci
2) Environment variables
Create a local .env (do not commit it). Use .env.example as a guide:

makefile
Copy
Edit
PORT=5500
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority

JWT_SECRET=replace_with_random_32+ chars
JWT_EXPIRES_IN=7d

# Email (optional for real emails)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=
SMTP_PASS=
SMTP_FROM=no-reply@subtrack.local

# Arcjet (optional)
ARCJET_KEY=

# Upstash QStash (optional)
QSTASH_URL=http://127.0.0.1:8080   # only for local dev server
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

SERVER_URL=http://localhost:5500
Tip: .env, .env.*, and *.env are ignored by .gitignore. Only .env.example is committed.

3) Run
Dev (auto-restart):

bash
Copy
Edit
npm run dev
Prod:

bash
Copy
Edit
npm run start
Health check:

bash
Copy
Edit
GET http://localhost:5500/_ping  → 200 "pong"
API
All JSON. Authentication uses Authorization: Bearer <JWT> unless stated otherwise.

Auth
Sign up
bash
Copy
Edit
POST /api/v1/auth/signup
Body

json
Copy
Edit
{ "name": "Ada", "email": "ada@example.com", "password": "secret123" }
Response

json
Copy
Edit
{
  "success": true,
  "message": "Signed up successfully",
  "data": {
    "token": "<JWT>",
    "user": { "_id": "...", "name": "Ada", "email": "ada@example.com" }
  }
}
HTTPie:

bash
Copy
Edit
http POST :5500/api/v1/auth/signup name=Ada email=ada@example.com password=secret123
Sign in
bash
Copy
Edit
POST /api/v1/auth/signin
Body

json
Copy
Edit
{ "email": "ada@example.com", "password": "secret123" }
Response

json
Copy
Edit
{
  "success": true,
  "message": "Signed in",
  "data": { "token": "<JWT>" }
}
HTTPie:

bash
Copy
Edit
http POST :5500/api/v1/auth/signin email=ada@example.com password=secret123
Subscriptions
Model fields (summary):

ts
Copy
Edit
name: string (3..200), required
price: number (0..1000), required
currency: 'EUR' | 'USD' | 'GBP' | 'INR' (default 'USD')
frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' (default 'monthly')
category: 'sports' | 'news' | 'entertainment' | 'lifestyle' | 'technology' | 'finance' | 'politics' | 'other'
paymentMethod: string
status: 'active' | 'expired' | 'canceled' (default 'active')
startDate: Date (must be past)
renewalDate: Date (auto-calculated if missing, based on frequency)
user: ObjectId<User> (owner)
category/frequency are case-sensitive in the schema as lowercase. Send entertainment, not Entertainment.

Create
bash
Copy
Edit
POST /api/v1/subscriptions
Authorization: Bearer <JWT>
Body (example)

json
Copy
Edit
{
  "name": "Netflix",
  "price": 12.99,
  "currency": "USD",
  "frequency": "monthly",
  "category": "entertainment",
  "paymentMethod": "card",
  "startDate": "2024-02-01"
}
Response

json
Copy
Edit
{ "success": true, "data": { "_id": "...", "name": "Netflix", ... } }
HTTPie:

bash
Copy
Edit
http POST :5500/api/v1/subscriptions \
  "Authorization:Bearer <JWT>" \
  name=Netflix price:=12.99 currency=USD frequency=monthly \
  category=entertainment paymentMethod=card startDate=2024-02-01
List my subscriptions
bash
Copy
Edit
GET /api/v1/subscriptions
Authorization: Bearer <JWT>
Response

json
Copy
Edit
{ "success": true, "data": [ { "_id": "...", "name": "Netflix", ... } ] }
HTTPie:

bash
Copy
Edit
http :5500/api/v1/subscriptions "Authorization:Bearer <JWT>"
In your code this handler queries Subscription.find({ user: req.user._id }).

Get one
bash
Copy
Edit
GET /api/v1/subscriptions/:id
Authorization: Bearer <JWT>
Response

json
Copy
Edit
{ "success": true, "data": { "_id": "...", "name": "Netflix", ... } }
Update
bash
Copy
Edit
PUT /api/v1/subscriptions/:id
Authorization: Bearer <JWT>
Body (partial allowed)

json
Copy
Edit
{ "price": 15.99, "status": "active" }
Response

json
Copy
Edit
{ "success": true, "data": { "_id": "...", "price": 15.99, ... } }
Delete
bash
Copy
Edit
DELETE /api/v1/subscriptions/:id
Authorization: Bearer <JWT>
Response

json
Copy
Edit
{ "success": true, "message": "Deleted" }
Users (optional, if you expose these)
Me
vbnet
Copy
Edit
GET /api/v1/users/me
Authorization: Bearer <JWT>
Get user by id (admin-only typically)
bash
Copy
Edit
GET /api/v1/users/:id
Authorization: Bearer <JWT>
Workflows / Webhooks (Upstash QStash, optional)
Reminder workflow receiver
bash
Copy
Edit
POST /api/v1/workflows/subscription/reminder
Content-Type: application/json
Body

json
Copy
Edit
{ "subscriptionId": "<mongo_id>" }
Notes

For local dev using the QStash dev server:

Publish to: http://127.0.0.1:8080/v2/publish/http://localhost:5500/api/v1/workflows/subscription/reminder

Body: { "subscriptionId": "<id>" }

For prod, point QStash to your https://yourdomain/api/v1/workflows/subscription/reminder.

If you verify signatures, ensure this route uses express.raw({ type: '*/*' }) before JSON parsing.

Health
bash
Copy
Edit
GET /_ping → 200 "pong"
Request Examples (quick copy/paste)
Sign up → Sign in → Create subscription → List mine
HTTPie:

bash
Copy
Edit
# SIGN UP
http POST :5500/api/v1/auth/signup name=Ada email=ada@example.com password=secret123

# SIGN IN (grab token)
http POST :5500/api/v1/auth/signin email=ada@example.com password=secret123
# export token to env var for convenience
# (on PowerShell: setx TOKEN "<paste_token_here>"; start a new shell to pick it up)

# CREATE SUBSCRIPTION
http POST :5500/api/v1/subscriptions "Authorization:Bearer <TOKEN>" \
  name=Netflix price:=12.99 currency=USD frequency=monthly \
  category=entertainment paymentMethod=card startDate=2024-02-01

# LIST MINE
http :5500/api/v1/subscriptions "Authorization:Bearer <TOKEN>"
cURL:

bash
Copy
Edit
curl -X POST http://localhost:5500/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada","email":"ada@example.com","password":"secret123"}'

curl -X POST http://localhost:5500/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"secret123"}'
# -> copy "token"

curl -X POST http://localhost:5500/api/v1/subscriptions \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"name":"Netflix","price":12.99,"currency":"USD","frequency":"monthly","category":"entertainment","paymentMethod":"card","startDate":"2024-02-01"}'

curl http://localhost:5500/api/v1/subscriptions -H "Authorization: Bearer <TOKEN>"
Error Format
Errors return a consistent JSON shape (examples):

json
Copy
Edit
{ "success": false, "error": "User already exists" }
json
Copy
Edit
{ "success": false, "error": "You are not the owner of this account!" }
Validation errors show Mongoose messages (e.g., enum mismatch, invalid dates).

Project Structure (typical)
graphql
Copy
Edit
subscription-tracker-api/
├─ app.js
├─ package.json
├─ .env.example
├─ config/
│  ├─ env.js
│  ├─ nodemailer.js          # optional if sending real emails
│  ├─ upstash.js             # workflow client
├─ models/
│  ├─ user.model.js
│  └─ subscription.model.js
├─ controllers/
│  ├─ auth.controller.js
│  └─ subscriptions.controller.js
├─ middlewares/
│  ├─ auth.middleware.js
│  └─ arcjet.middleware.js   # optional
├─ routes/
│  ├─ auth.routes.js
│  ├─ subscriptions.routes.js
│  └─ workflows.routes.js    # POST /subscription/reminder
├─ utils/
│  └─ send-email.js          # optional
Security Notes
Never commit real .env files. Only .env.example is in git.

Use HTTPS in prod (Nginx + Let’s Encrypt).

Set app.set('trust proxy', true) when behind a reverse proxy so IPs are correct.

Scope queries to req.user._id for “my data” endpoints.

If using Gmail, use an App Password (not your account password).

Deployment (VPS quick path)
Install Node (nvm), npm ci, set .env.

Use pm2 start app.js --name subtrack && pm2 save.

Nginx reverse proxy to 127.0.0.1:5500.

Open firewall for 80/443; keep Node port private.

For QStash: use real cloud token/keys and SERVER_URL=https://yourdomain.
