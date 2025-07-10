# Ordexa

# 🛒 Ordering Microservices Architecture

A production-ready, scalable Ordering System built with modern tools — powered by **Bun**, **PostgreSQL**, **Apache Kafka**, **Cassandra**, and **CQRS + Event-Driven architecture**.

---

## 🚀 Tech Stack

| Layer         | Technology           | Purpose                                 |
|---------------|----------------------|-----------------------------------------|
| Frontend      | Bun + Vite           | Lightning-fast SPA                      |
| Backend       | Express (Bun)        | REST APIs for orders                    |
| ORM           | Prisma               | DB access (PostgreSQL)                  |
| Write DB      | PostgreSQL           | Normalized transactional store          |
| Read DB       | Cassandra            | Fast denormalized queries               |
| Messaging     | Apache Kafka         | Real-time event streaming               |
| Event Pattern | Outbox + CQRS        | Consistency between DB and Kafka        |
| Testing       | Bun test + GitHub CI | Fast test automation                    |

---

## 📐 Architecture Overview

```plaintext
          [Frontend (Vite + Bun)]
                    │
                    ▼
[Express API (Bun)] --(Prisma)--> [PostgreSQL]
│                                     │
└---------> [Outbox Table] <----------┘
                    │
                    ▼
             [Kafka Producer]
                    │
                    ▼
              [Kafka Broker]
                    │
                    ▼         
             [Kafka Consumer]
                    │
                    ▼
               [Cassandra]
```

## 🧠 Key Concepts

### ✅ CQRS (Command Query Responsibility Segregation)
- **Write Side (PostgreSQL)**: Handles commands — create, update, cancel orders.
- **Read Side (Cassandra)**: Handles queries — get orders by user, by status, etc.

### ✅ Outbox Pattern
Ensures consistency by writing Kafka events *after* successful DB transactions.

### ✅ Kafka Event Flow
- Events: `order.created`, `order.updated`
- Message Format: JSON/Avro
- Consumers update Cassandra views

---

## 🧪 Testing & CI

- `bun test` for unit and integration tests
- GitHub Actions pipeline runs:
  - Dependency install
  - Bun tests
  - Optional Docker services for Kafka/Postgres testing

---

## 📦 Folder Structure

```plaintext
ordering-microservices/
├── apps/
│ ├── frontend/ # Bun + Vite (React)
│ └── backend/ # Bun + Express + Prisma
│ ├── src/
│ │ ├── api/ # Express routes & handlers
│ │ ├── services/ # Order logic, outbox logic
│ │ ├── kafka/ # Producer/consumer logic
│ │ ├── db/ # Prisma schema & PostgreSQL logic
│ │ └── cassandra/ # Cassandra query logic
│ ├── tests/ # Bun test cases (unit + integration)
│ └── bunfig.toml # Bun config file
│
├── infra/
│ ├── docker-compose.yml # Full stack (Kafka, PostgreSQL, Cassandra)
│ ├── kafdrop.yml # Kafka UI dashboard
│ └── test.override.yml # Docker Compose override for testing
│
├── .github/
│ └── workflows/
│ └── test.yml # GitHub Actions CI workflow
│
├── README.md # You're here
└── LICENSE # Open-source license
```

---

## 🔒 Security & Scalability Features

- UUIDs for all IDs (collision-free)
- UTC timestamps everywhere
- Idempotent Kafka consumers
- Dead Letter Queues (DLQs) support
- Retry, backoff, observability-ready

---

## 🔍 Future Enhancements

- 🔁 Saga Pattern for distributed workflows (Order → Payment → Ship)
- 🔍 Redis + Elasticsearch for caching and search
- 📊 Prometheus + Grafana + Loki for observability
- 🧪 Playwright for E2E testing

---

## 🛠 Suggested Commands

```bash
# Backend (Bun + Express)
cd apps/backend
bun install
bun dev

# Frontend (Bun + Vite)
cd apps/frontend
bun install
bun dev

# Run Tests
bun test

# Start Full Infra (Dev)
docker-compose up -d
