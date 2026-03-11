<br />
<div align="center">
  <img src="https://raw.githubusercontent.com/abhisheknaiidu/abhisheknaiidu/master/code.gif" alt="Coding Animation" width="100%" height="200"/>
</div>

<h1 align="center">🚀 Ultimate TypeScript Express Boilerplate</h1>

<div align="center">
  <p><strong>A production-ready, industry-standard backend boilerplate designed for scale and developer experience.</strong></p>

  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=4000&pause=1000&color=2563EB&center=true&vCenter=true&width=500&lines=TypeScript+%2B+Express.js;MongoDB,+Postgres,+MySQL;RabbitMQ+%2B+Kafka+Queuing;Docker+%2B+Kubernetes+Ready" alt="Typing SVG" />
  </a>
</div>

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)

</div>

<br />

## ✨ Features

- 🏗️ **Multi-Database Support**: Dynamically switch between **MongoDB**, **PostgreSQL**, and **MySQL** seamlessly.
- 🔐 **Authentication & OAuth**: Built-in **Passport.js** for email/password, Google, and GitHub strategies, combined with secure **JWT** logic.
- 📨 **Messaging Queues**: Industry-standard async processing with **RabbitMQ** and **Kafka**.
- 🛠️ **Validation & Types**: **Zod** schema validation and 100% strict TypeScript configurations.
- 💳 **Payments & Webhooks**: Pre-configured **Stripe** integrations.
- 📊 **Monitoring & Observability**: **OpenTelemetry** traces, Winston/Pino logging with **Grafana Loki** shipping.
- 🐳 **Containerization**: Included `docker-compose.yml` and Kubernetes (`k8s/`) manifests (HPA, Ingress, Deployments).
- ⏱️ **Cron Jobs & Tasks**: Background scheduling out-of-the-box using `node-cron`.
- 📁 **Cloudinary Integrations**: Pre-wired for multimedia storage.

---

## ⚡ Quick Start

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- Optional: Docker, MongoDB, Postgres, or MySQL running locally if not using Docker.

### 2. Clone the Repository
```bash
git clone https://github.com/Nayem-Dev/TS_Boiler_Plate.git
cd TS_Boiler_Plate
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Duplicate the `.env.example` file to create your local `.env`:
```bash
cp .env.example .env
```
Inside your `.env`, populate the required fields. You can easily switch databases by setting `DB_TYPE`:
```env
# Switch between: mongodb | postgres | mysql
DB_TYPE=mongodb
MONGODB_URL=mongodb://localhost:27017/my_database
```

### 5. Run the Server
We use `tsx` (TypeScript Execute) for lightning-fast hot-reloading in development.
```bash
npm run dev
```
> Server should now be running on `http://localhost:5001`! 🚀

---

## 📂 Project Structure

```text
src/
├── app.ts                 # Express application setup 
├── server.ts              # Entry point & boot manager
├── auth/                  # Passport.js & authentication strategies
├── config/                # Environment variables parsing & setup
├── database/              # DB Adapters (MongoDB, Postgres, MySQL)
├── jobs/                  # Cron jobs & task scheduling
├── lib/                   # Libraries (e.g., Redis)
├── modules/               # Domain-driven features (Models, Services, Controllers)
├── observability/         # OpenTelemetry & Tracing setup
├── queues/                # Kafka & RabbitMQ connections
├── routes/                # application route aggregators
└── utils/                 # Utilities and helpers
```

---

## 🛠️ Scripts Overview

| Command | Description |
|---|---|
| `npm run dev` | Starts the server in development mode using `tsx` with hot-reloading |
| `npm run build` | Typechecks code and compiles TypeScript to JavaScript (`dist/`) |
| `npm start` | Runs the compiled application |
| `npm run typecheck` | Checks the codebase for TS typing errors without outputting files |
| `npm run lint:fix` | Automatically formats and lints your code using ESLint and Prettier |

---

## 🤝 Contributing
Contributions are always welcome! Feel free to open an issue or submit a Pull Request to help improve the boilerplate.

<div align="center">
  <sub>Built with ❤️ by the community. Stay awesome! 🚀</sub>
</div>
