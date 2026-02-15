<div align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="typescript" width="80" height="80"/>
  <h1>🚀 Scalable TypeScript Backend Boilerplate</h1>
  <p><b>A production-ready, secure, and robust backend architecture built with Node.js & TypeScript.</b></p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
  [![Express](https://img.shields.io/badge/Express-5.0-lightgrey.svg)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)
  [![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
</div>

---

## 📖 About

A production-ready, highly secure, and scalable backend architecture built with **Node.js, Express 5.0, TypeScript, and MongoDB**. This boilerplate provides a solid foundation for **enterprise-level applications** with a focus on **security, performance, observability, and developer experience**.

Perfect for startups, MVPs, and scalable API-first applications.

---

## ✨ Key Features

### 🔐 Security
- 🛡️ **Helmet**: Secures HTTP headers
- 🌐 **CORS**: Configurable Cross-Origin Resource Sharing
- 🚫 **HPP**: Protection against HTTP Parameter Pollution attacks
- 💉 **MongoSanitize**: Prevents MongoDB Operator Injection
- 🚦 **Rate Limiting**: Built-in traffic control for APIs
- 🔑 **JWT Authentication**: Access + Refresh token pattern with bcrypt password hashing
- ✅ **Zod Validation**: Runtime schema validation for environment variables and request data

### 📊 Observability & Debugging
- 🔭 **OpenTelemetry**: Integrated distributed tracing and metrics
- 📝 **Pino**: High-performance, structured JSON logging
- 🏷️ **Request ID**: Automatic request tagging for end-to-end tracing
- 📈 **Metrics Endpoint**: Prometheus-compatible `/metrics` endpoint
- 🎯 **Global Error Handling**: Centralized error normalization (distinguishes operational vs. programming errors)

### 🏗️ Architecture & Code Quality
- 🎨 **Clean Architecture**: Feature-based modular structure (Controller → Service → Model)
- 🔒 **Strict TypeScript**: Full type safety with `strict: true` and all strict flags enabled
- 🧪 **Testing Ready**: Vitest integration for unit and integration tests
- 🪝 **Git Hooks**: Husky + Lint-Staged for pre-commit quality gates
- 📏 **Code Standards**: ESLint + Prettier + Commitlint for consistent code style
- 📚 **API Documentation**: Auto-generated Swagger/OpenAPI documentation

### 🚀 Developer Experience
- ⚡ **Hot Reloading**: Fast development loop with `tsx watch`
- 🐳 **Docker Ready**: Multi-stage Dockerfile with security best practices
- 🔄 **CI/CD Pipeline**: GitHub Actions workflow configured
- 📧 **Email Service**: Nodemailer integration for transactional emails
- 📸 **File Upload**: Multer + Cloudinary integration ready
- 💳 **Payment Ready**: Stripe integration scaffolding included

### 🔧 Core Technologies
- **Express 5.0**: Latest Express with native Promise support in middleware/handlers
- **MongoDB & Mongoose**: Object modeling with strict schema validation
- **Real-time Ready**: Socket.io integration scaffolding for bi-directional communication

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Runtime** | Node.js (v18+) |
| **Language** | TypeScript 5.9+ |
| **Framework** | Express.js 5.0 |
| **Database** | MongoDB via Mongoose |
| **Validation** | Zod |
| **Security** | Helmet, CORS, HPP, Express-Mongo-Sanitize, Rate Limiting |
| **Logging** | Pino & Pino-Pretty |
| **Observability** | OpenTelemetry, Prometheus Metrics |
| **Testing** | Vitest, Supertest |
| **File Storage** | Cloudinary / Multer |
| **Payments** | Stripe |
| **Real-time** | Socket.io (scaffolding) |
| **Email** | Nodemailer |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (Local or Atlas)
- **Docker** (Optional, for containerized deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nsarkar-XLR8/TS_BACKEND.git
   cd TS_BACKEND/TS_Boiler_Plate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   
   **Required environment variables:**
   ```env
   NODE_ENV=development
   PORT=5001
   
   MONGODB_URL=your_mongodb_connection_string
   
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret
   JWT_REFRESH_EXPIRES_IN=30d
   
   EMAIL_ADDRESS=your_email@example.com
   EMAIL_PASSWORD=your_email_app_password
   
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Run Locally**
   ```bash
   npm run dev
   ```
   
   The server will start at `http://localhost:5001` (or your configured port).
   
   **API Documentation** is available at `http://localhost:5001/api-docs` (in development mode).

---

## 🧪 Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server with hot-reload |
| `npm run build` | Compiles TypeScript to JavaScript in `dist/` |
| `npm start` | Runs the compiled application (production mode) |
| `npm run typecheck` | Runs TypeScript type checking without emitting files |
| `npm run lint` | Lints the codebase using ESLint |
| `npm run lint:fix` | Automatically fixes linting issues |
| `npm test` | Runs tests using Vitest |
| `npm run test:watch` | Runs tests in watch mode |
| `npm run ci` | Runs typecheck, lint, and test (used in CI pipeline) |
| `npm run clean` | Removes the `dist/` directory |

---

## 📂 Project Structure

```text
TS_BACKEND/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI/CD pipeline
├── TS_Boiler_Plate/        # Main application directory
│   ├── src/
│   │   ├── config/         # Environment variables & configuration
│   │   ├── constant/       # Static constants
│   │   ├── emails/         # Email templates and logic
│   │   ├── errors/         # Custom error classes and handlers
│   │   ├── lib/            # Third-party library configurations
│   │   ├── middlewares/    # Express middlewares (Auth, Validation, etc.)
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication module
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.route.ts
│   │   │   │   └── auth.interface.ts
│   │   │   └── user/       # User module
│   │   │       ├── user.controller.ts
│   │   │       ├── user.service.ts
│   │   │       ├── user.route.ts
│   │   │       ├── user.model.ts
│   │   │       └── user.interface.ts
│   │   ├── observability/  # OpenTelemetry & Metrics setup
│   │   ├── routes/         # Main router entry point
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Helper functions
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── tests/
│   │   └── integration/    # Integration tests
│   ├── .env.example        # Environment variables template
│   ├── .gitignore
│   ├── Dockerfile          # Multi-stage Docker build
│   ├── docker-compose.yml  # Docker Compose configuration
│   ├── package.json
│   ├── tsconfig.json       # TypeScript configuration
│   └── vitest.config.ts    # Vitest configuration
└── README.md               # This file
```

---

## 🔐 Authentication Flow

This boilerplate includes a complete authentication system:

### 1. **User Registration**
- User submits registration data
- System validates input with Zod
- Password is hashed with bcrypt
- OTP is generated and sent via email
- User record is created (unverified)

### 2. **Email Verification**
- User receives OTP via email
- User submits email + OTP
- System verifies OTP and expiry
- User account is marked as verified

### 3. **Login**
- User submits credentials
- System validates email and password
- Access token (7 days) and refresh token (30 days) are generated
- Tokens are returned to client

### 4. **Password Reset**
- User requests password reset with email
- OTP is generated and sent via email
- User verifies OTP
- Short-lived reset token (15 mins) is issued
- User submits new password with reset token
- Password is updated and OTP is cleared

---

## 🐳 Docker Deployment

### Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop the container
docker-compose down
```

### Build Docker Image Manually

```bash
# Build the image
docker build -t ts-backend:latest .

# Run the container
docker run -p 5001:5001 --env-file .env ts-backend:latest
```

**Docker Features:**
- ✅ Multi-stage build for optimized image size
- ✅ Non-root user for security
- ✅ Alpine Linux base for minimal footprint
- ✅ Production-only dependencies in final image

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

```text
tests/
└── integration/
    └── health.test.ts      # Health check endpoint tests
```

**Testing Stack:**
- **Vitest**: Fast unit testing framework
- **Supertest**: HTTP assertion library
- **Coverage**: Built-in code coverage reporting

---

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
NODE_ENV=development
PORT=5001

# Database
MONGODB_URL=mongodb://localhost:27017/your_database

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration
EMAIL_ADDRESS=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
ADMIN_EMAIL=admin@example.com

# Cloudinary (File Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenTelemetry (Optional)
OTEL_SERVICE_NAME=ts-boilerplate-api
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
OTEL_TRACES_EXPORTER=otlp

# Stripe (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_ADMIN_SECRET=your_webhook_secret

# Security (Optional)
AES_KEY=your_aes_encryption_key
AES_IV=your_aes_initialization_vector

# Frontend URLs (Optional)
RESET_PASSWORD_URL=http://localhost:3000/reset-password
FRONT_END_URL=http://localhost:3000
```

---

## 📚 API Documentation

### Swagger/OpenAPI

When running in development mode, interactive API documentation is available at:

```
http://localhost:5001/api-docs
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/metrics` | Prometheus metrics |
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/verify-email` | Verify email with OTP |
| `POST` | `/api/v1/auth/login` | User login |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset |
| `POST` | `/api/v1/auth/verify-otp` | Verify OTP for password reset |
| `POST` | `/api/v1/auth/reset-password` | Reset password |

---

## 🔒 Security Best Practices

This boilerplate implements multiple security layers:

1. **HTTP Security Headers** (Helmet)
2. **CORS Protection** with configurable origins
3. **Rate Limiting** to prevent abuse
4. **NoSQL Injection Prevention** (mongo-sanitize)
5. **XSS Protection** via input sanitization
6. **HPP Protection** against parameter pollution
7. **JWT Token Security** with separate access/refresh tokens
8. **Password Hashing** with bcrypt (configurable salt rounds)
9. **Request Size Limits** (JSON: 50kb, URL-encoded: 1mb)
10. **Request Timeout** (15 seconds)
11. **Environment Variable Validation** with Zod
12. **Error Hiding** in production (no stack traces exposed)

---

## 🚦 CI/CD Pipeline

GitHub Actions workflow is configured to run on every push and pull request:

**Pipeline Steps:**
1. ✅ Checkout code
2. ✅ Setup Node.js
3. ✅ Install dependencies
4. ✅ Type checking
5. ✅ Linting
6. ✅ Run tests
7. ✅ Build production bundle

**Configuration:** `.github/workflows/ci.yml`

---

## 📈 Monitoring & Observability

### OpenTelemetry Integration

Distributed tracing is automatically enabled for:
- HTTP requests
- Database queries
- External API calls

### Metrics Endpoint

Prometheus-compatible metrics available at `/metrics`:
- HTTP request duration
- Request count by status code
- Active connections
- Memory usage
- CPU usage

### Logging

Structured JSON logging with Pino:
- Request/Response logging
- Error logging with stack traces
- Request ID tracking for correlation

---

## 🤝 Contributing

Contributions are welcome! 🎉

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Commit Convention:** This project uses [Conventional Commits](https://www.conventionalcommits.org/).

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Pino](https://getpino.io/) - High-performance logger
- [OpenTelemetry](https://opentelemetry.io/) - Observability framework
- [Zod](https://zod.dev/) - TypeScript-first schema validation

---

## 📞 Support

For questions or issues, please:
- Open an issue on GitHub
- Contact: [Nsarkar-XLR8](https://github.com/Nsarkar-XLR8)

---

<div align="center">
  <b>Made with ❤️ by <a href="https://github.com/Nsarkar-XLR8">Nsarkar-XLR8</a></b>
  <br><br>
  ⭐ Star this repo if you find it helpful!
</div>
