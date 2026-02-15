<div align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="typescript" width="80" height="80"/>
  <h1>🚀 Scalable TS Backend Boilerplate</h1>
  <p><b>A production-ready, secure, and robust backend architecture built with Node.js & TypeScript.</b></p>
</div>

---

## 🚀 Robust & Scalable TypeScript Backend Boilerplate
A production-ready, highly secure, and scalable backend architecture built with **Node.js, Express, TypeScript, and MongoDB**.  
This boilerplate provides a solid foundation for **enterprise-level applications** with a focus on **security, performance, and developer experience**.



# Production-Ready TypeScript Backend Boilerplate

A robust, enterprise-grade backend boilerplate built with **Node.js (Express 5.0)**, **TypeScript**, and **MongoDB**. Designed for scalability, security, and developer experience.

## 🚀 Features

### Core
- **Express 5.0**: Leveraging the latest Express features including native Promise support in middleware/handlers.
- **TypeScript**: Strict type safety (`strict: true`, `exactOptionalPropertyTypes`) for reliable code.
- **MongoDB & Mongoose**: Object modeling with strict schema validation.
- **Zod**: Runtime schema validation for environment variables and request data.

### Security
- **Helmet**: Secures HTTP headers.
- **CORS**: Configurable Cross-Origin Resource Sharing.
- **HPP**: Protection against HTTP Parameter Pollution attacks.
- **MongoSantilize**: Prevents MongoDB Operator Injection.
- **Rate Limiting**: Built-in traffic control for APIs.

### Observability & Debugging
- **OpenTelemetry**: Integrated tracing and metrics.
- **Pino**: High-performance, structured JSON logging.
- **Request ID**: Automatic request tagging for end-to-end tracing.
- **Global Error Handling**: Centralized error normalization (distinguishes operational vs. programming errors).

### Developer Experience
- **Hot Reloading**: Fast development loop with `tsx`.
- **Husky & Lint-Staged**: Pre-commit hooks to ensure code quality.
- **Vitest**: Blazing fast unit and integration testing.
- **Swagger/OpenAPI**: Auto-generated API documentation.
- **Docker**: Ready-to-deploy `Dockerfile` and `docker-compose.yml`.

## 🛠️ Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (Local or Atlas)
- **Docker** (Optional, for containerized run)

## 📦 Getting Started

1.  **Clone the repository**
    ```bash
    git clone <your-repo-url>
    cd ts_boiler_plate
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Copy `.env.example` to `.env` and fill in your credentials.
    ```bash
    cp .env.example .env
    ```
    *Ensure you provide a valid `MONGODB_URL`.*

4.  **Run Locally**
    ```bash
    npm run dev
    ```
    The server will start at `http://localhost:5000` (or your configured port).
    API Documentation is available at `http://localhost:5000/api-docs` (in development mode).

## 🧪 Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server with hot-reload |
| `npm run build` | Compiles TypeScript to JavaScript in `dist/` |
| `npm start` | Runs the compiled application (production mode) |
| `npm run typecheck` | Runs TypeScript type checking without emitting files |
| `npm run lint` | Lints the codebase using ESLint |
| `npm test` | Runs tests using Vitest |
| `npm run ci` | Runs typecheck, lint, and test (used in CI pipeline) |

## 📂 Project Structure

```text
src/
├── config/         # Environment variables & configuration
├── constant/       # Static constants
├── emails/         # Email templates and logic
├── errors/         # Custom error classes and handlers
├── middlewares/    # Express middlewares (Auth, Validation, etc.)
├── modules/        # Feature modules (Controller, Service, Route, Interface)
├── observability/  # OpenTelemetry & Metrics setup
├── routes/         # Main router entry point
├── utils/          # Helper functions
├── app.ts          # App setup (Express)
└── server.ts       # Server entry point
```

## 🐳 Docker

Build and run the container:

```bash
docker-compose up --build
```

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the ISC License.
