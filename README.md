# ShortLink

A distributed URL shortening service built with **Node.js, Express, PostgreSQL, Redis, Docker, and Nginx**.

## Features

* Create short URLs from long URLs
* Base62 short-code generation
* PostgreSQL for persistent URL storage
* Redis caching for faster URL lookups
* Redis-based rate limiting
* Link expiration support
* Click count tracking
* Rate-limit information
* Nginx reverse proxy and load balancing
* Multiple API instances for horizontal scaling
* Dockerized application infrastructure
* PostgreSQL database migrations
* k6 load testing

## Tech Stack

* **Node.js**
* **Express.js**
* **PostgreSQL**
* **Redis**
* **Docker & Docker Compose**
* **Nginx**
* **node-pg-migrate**
* **k6**

## Architecture

```text
                         Client
                           │
                           ▼
                        Nginx
                           │
                  ┌────────┴────────┐
                  ▼                 ▼
               API #1             API #2
                  │                 │
                  └────────┬────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
                  Redis       PostgreSQL
              Cache + Rate      URL Data
                 Limiting
```

## Prerequisites

To run the project locally, install:

* **Git**
* **Docker**
* **Docker Compose**

Docker Desktop or Docker Engine with Docker Compose is sufficient.

Verify the installation:

```bash
git --version
docker --version
docker compose version
```

## Getting Started

### 1. Clone the repository

```bash
git clone <your-github-repository-url>
cd shortlink
```

### 2. Configure environment variables

Create your environment file:

```bash
cp .env.example .env
```

Update `.env` with the required configuration.

**Do not commit `.env` to Git.**

The environment configuration contains settings for:

* PostgreSQL
* Redis
* Application port
* Other application configuration

### 3. Start the application

Build and start the complete Dockerized application:

```bash
docker compose up -d --build
```

This starts:

```text
Nginx
API #1
API #2
PostgreSQL
Redis
```

### 4. Check running services

```bash
docker compose ps
```

All required containers should show as running.

### 5. Run database migrations

Run migrations from an API container:

```bash
docker compose exec api1 npm run migrate up
```

If the database is already up to date, the migration command will report:

```text
No migrations to run
```

### 6. Verify the API

Health check:

```bash
curl http://localhost/health
```

A successful response confirms that the application is running behind Nginx.

## Using the API

### Create a Short URL

Send a POST request:

```http
POST /api/links
Content-Type: application/json
```

Example:

```bash
curl -X POST http://localhost/api/links \
  -H "Content-Type: application/json" \
  -d '{"longUrl":"https://github.com"}'
```

Example response:

```json
{
  "shortCode": "1",
  "shortUrl": "http://localhost/1",
  "longUrl": "https://github.com"
}
```

### Open the Short URL

Use the generated short URL:

```text
http://localhost/1
```

The application will redirect to the original URL.

### Health Check

```http
GET /health
```

Example:

```bash
curl http://localhost/health
```

## Rate Limiting

The current rate limit is:

```text
5 requests per 60 seconds
```

The rate limiter uses Redis `INCR` and `TTL` to maintain the request counter and expiration window.

When the limit is exceeded, the API returns a rate-limit response.

## Caching

Redis uses a cache-aside approach for URL lookups:

```text
Request
   ↓
 Redis
   │
   ├── HIT  → Return cached URL
   │
   └── MISS
        ↓
    PostgreSQL
        ↓
      Redis
```

This reduces repeated database queries for frequently accessed short URLs.

## Horizontal Scaling & Load Balancing

The application runs two Node.js API instances:

```text
                    Nginx
                   /     \
                  ▼       ▼
               API #1   API #2
```

Nginx distributes incoming requests between the API instances.

Both API instances share the same:

* PostgreSQL database
* Redis instance

The API containers are not directly exposed to the host. Nginx acts as the public entry point.

## Docker

The complete application runs through Docker Compose.

Start:

```bash
docker compose up -d
```

Rebuild after code changes:

```bash
docker compose up -d --build
```

Check containers:

```bash
docker compose ps
```

View API #1 logs:

```bash
docker compose logs -f api1
```

View API #2 logs:

```bash
docker compose logs -f api2
```

View Nginx logs:

```bash
docker compose logs -f nginx
```

View all logs:

```bash
docker compose logs -f
```

Stop the application:

```bash
docker compose down
```

Stop and remove containers while keeping the PostgreSQL volume:

```bash
docker compose down
```

To remove the database volume as well:

```bash
docker compose down -v
```

**Warning:** removing the volume deletes the persisted PostgreSQL data.

## Database Migrations

Run:

```bash
docker compose exec api1 npm run migrate up
```

Check the migration status/output to confirm that the database schema is up to date.

## Load Testing

The project includes a k6 load test.

Run:

```bash
k6 run tests/load-test.js
```

The tested configuration achieved:

```text
Virtual Users:    50
Duration:         30 seconds
Requests:         1,500
Throughput:       ~49 req/s
Failed Requests:  0%
```

The load test verifies that requests successfully pass through Nginx and the API infrastructure.

## Database

PostgreSQL stores:

* Short code
* Original URL
* Owner ID
* Click count
* Creation time
* Expiration time

PostgreSQL data is persisted using a Docker volume.

## Project Structure

```text
shortlink/
├── src/
├── migrations/
├── nginx/
│   └── nginx.conf
├── tests/
│   └── load-test.js
├── Dockerfile
├── docker-compose.yml
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Environment

The project uses environment variables for application configuration, PostgreSQL, and Redis.

The `.env` file is intentionally excluded from Git.

Use `.env.example` as the template for local configuration.

The complete application stack runs inside Docker, so PostgreSQL and Redis do not need to be installed separately on the host machine.

## Stopping the Project

```bash
docker compose down
```

To start it again later:

```bash
docker compose up -d
```

The PostgreSQL Docker volume preserves the database data between normal container shutdowns.
