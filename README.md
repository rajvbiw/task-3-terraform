# 🚀 DevOps Control Center: Express & Vanilla JS Application Suite

Welcome! This is a production-grade, highly-visual **DevOps Control Center** built using **Node.js (Express)** on the backend and modern **Vanilla HTML/CSS/JS** on the frontend. 

It is designed specifically as an interactive, comprehensive application for DevOps Engineers to demonstrate local microservices, containerization best practices, monitoring setups, and native automated testing.

---

## 🌟 Key Features

1. **📊 Real-time System Monitor**:
   - Animated circular telemetry gauges for **CPU Utilization** (simulated load with random walks) and **Memory RSS/Heap allocation** (real-time process memory).
   - Live **Network Throughput** (RX/TX speeds) trackers.
   - **live_stdout_stream.log**: A scrollable, colorized developer terminal rendering live server logs dynamically streamed from the host backend.

2. **📋 DevOps Kanban Task Board**:
   - Create, list, transition, and delete tasks in a classic backlog interface.
   - Categorize by `Docker`, `Monitoring`, `CI/CD`, `Kubernetes`, `Security`, etc.
   - Assign priorities (`High`, `Medium`, `Low`) to mimic actual production sprints.
   - **Persisted Database**: Tasks are saved locally to `tasks.json` so states are preserved across restarts.

3. **🎮 Downtime Sandbox (Tic-Tac-Toe)**:
   - Challenge the smart System AI or play locally against another user.
   - Built-in **Minimax Algorithm** guarantees the AI will play optimally, making it extremely difficult (or impossible!) to defeat.
   - Visual board with glowing, pulsing hover states, scoring panels, and draw evaluations.

4. **🔬 API Diagnostics Explorer**:
   - An interactive console to test raw endpoints.
   - Inspect responses for `/health`, `/metrics`, `/api/tasks`, and `/api/system` directly inside the browser UI, displaying headers, response latencies, and pretty-printed JSON payloads.

5. **📈 Production DevOps Integrations**:
   - **Prometheus Metrics (`/metrics`)**: Exposes structured metrics (`http_requests_total`, `node_memory_usage_bytes`, `node_uptime_seconds`, and `tasks_total`) ready to be scraped by standard Prometheus scrapers.
   - **Liveness & Readiness Probes (`/health`)**: Full operational health status probe.
   - **Multi-stage Dockerfile**: Security-conscious rootless setup running as `node` user in `node:26-alpine`.
   - **Orchestrated Monitoring stack**: Launch the app alongside a Prometheus monitoring server with a single command.
   - **CI/CD Workflow**: Built-in GitHub Actions configurations to validate testing and container builds.

---

## 🛠️ Tech Stack

- **Backend**: Node.js (v26.0.0+), Express.js, Morgan (structured request logger)
- **Frontend**: Single-Page Dashboard (HTML5, Vanilla CSS Grid/Flexbox, Custom variables, Glassmorphism design, Vanilla ES6 JavaScript)
- **Testing**: Native Node.js Test Runner (`node:test` and `node:assert`)
- **Containers & Orchestration**: Docker, Docker Compose, Prometheus Server

---

## 📂 Project Directory Structure

```text
├── package.json          # Node.js dependencies, environment, and scripts
├── server.js             # Core Express server, API routers, and metrics generators
├── Dockerfile            # Multi-stage production-ready secure Docker config
├── docker-compose.yml    # Main orchestration composer (App + Prometheus)
├── prometheus.yml        # Telemetry scraper settings for Prometheus
├── .dockerignore         # Docker context exclusion filter
├── .gitignore            # Git exclusion filter
├── .github/
│   └── workflows/
│       └── ci.yml        # GitHub Actions continuous integration workflow
├── public/               # Frontend Assets
│   ├── index.html        # Single-page control center html UI
│   ├── css/
│   │   └── style.css     # Premium dark/light glassmorphism styling
│   └── js/
│       ├── app.js        # Telemetry gauges, logs, Kanban CRUD, and API console
│       └── tictactoe.js  # Tic-Tac-Toe Minimax AI logic
└── tests/
    └── server.test.js    # Integration & API tests (using native Node runner)
```

---

## 🚀 Running the Application

### Method 1: Local Development (Node.js)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the application in Development Mode** (utilizes Node's native hot-reloading `--watch` flag):
   ```bash
   npm run dev
   ```

3. **Start in Production Mode**:
   ```bash
   npm start
   ```

4. **Access the application**:
   - **Control Center Dashboard**: [http://localhost:3000](http://localhost:3000)
   - **Health Checks**: [http://localhost:3000/health](http://localhost:3000/health)
   - **Prometheus Metrics**: [http://localhost:3000/metrics](http://localhost:3000/metrics)

---

### Method 2: Docker Compose (The DevOps Orchestration)

To spin up the entire production-grade monitoring environment containing the Node app AND a scraping Prometheus server:

1. **Launch container stack**:
   ```bash
   docker compose up -d --build
   ```

2. **Verify services**:
   - Check container health status: `docker compose ps`
   - **Control Center Dashboard**: [http://localhost:3000](http://localhost:3000)
   - **Prometheus Query UI**: [http://localhost:9090](http://localhost:9090)

3. **Stop container stack**:
   ```bash
   docker compose down
   ```

---

## 🧪 Running Automated Tests

We leverage the modern **native Node.js test runner** which executes tests with lightning-fast speeds and zero bloated libraries.

To run integration testing for API endpoints, JSON formats, health status probes, and Prometheus scraper structures:

```bash
npm test
```

---

## 📊 Scraping Metrics with Prometheus

When launching using `docker compose`, the Prometheus scraper will automatically scrape the application's `/metrics` endpoint every **5 seconds**.

You can navigate to the [Prometheus Query Dashboard](http://localhost:9090) and search for the following custom metrics:

- `node_uptime_seconds`: Tracking the process life duration.
- `node_memory_usage_bytes`: Track rss, heapTotal, heapUsed, and external memory metrics. Filter by type using `{type="heapUsed"}`.
- `tasks_total`: Total DevOps tasks categorized by their sprint progress. Filter using `{status="in-progress"}` or `{status="completed"}`.
- `http_requests_total`: Tracks the total number of HTTP requests processed by the server. Allows querying query count details like:
  ```promql
  sum(http_requests_total) by (path, method, status)
  ```

---

## 🛡️ DevOps Best Practices Implemented

- **Multi-Stage Build**: Keeps the runtime Docker image extremely slim (only `~50MB` utilizing `alpine` runtimes), cutting out development build layers.
- **Security Isolation**: Container processes do NOT run as root. They run under the rootless `node` user account to prevent privilege escalation vulnerabilities.
- **Container Probing**: Integrated a custom Docker `HEALTHCHECK` running an inline Node fetch. The container will turn `healthy`/`unhealthy` automatically depending on REST health endpoints.
- **CI/CD Automation**: GitHub actions configures tests to run automatically and builds the docker context on every push or merge.
