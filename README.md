# ShortLink

A URL shortening service built with **Node.js, Express, PostgreSQL, Redis, and Docker**.

## Features

* Create short URLs from long URLs
* Base62 short-code generation
* PostgreSQL for persistent URL storage
* Redis caching for faster URL lookups
* Redis-based rate limiting
* Link expiration support
* Click count tracking
* Rate-limit information
* Dockerized Node.js, PostgreSQL, and Redis services
* PostgreSQL database migrations

## Tech Stack

* **Node.js**
* **Express.js**
* **PostgreSQL**
* **Redis**
* **Docker & Docker Compose**
* **node-pg-migrate**

## Architecture

```text
Client
  │
  ▼
Node.js / Express
  │
  ├──────────► Redis
  │             ├── Cache
  │             └── Rate Limiting
  │
  └──────────► PostgreSQL
                └── URL Data
```

## API

### Create Short URL

```http
POST /api/links
```

Request:

```json
{
  "longUrl": "https://github.com"
}
```

Response:

```json
{
  "shortCode": "1",
  "shortUrl": "http://localhost:3000/1",
  "longUrl": "https://github.com"
}
```

### Redirect

```http
GET /:shortCode
```

Example:

```text
http://localhost:3000/1
```

The service looks up the short code and redirects to the original URL.

### Health Check

```http
GET /health
```

## Rate Limiting

The current rate limit is:

```text
5 requests per 60 seconds
```

The rate limiter uses Redis `INCR` and `TTL` to maintain the request counter and expiration window.

## Caching

Redis uses a cache-aside approach:

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

## Docker

The application runs using three Docker services:

```text
API
PostgreSQL
Redis
```

Start the application:

```bash
docker compose up -d
```

Check services:

```bash
docker compose ps
```

View API logs:

```bash
docker compose logs -f api
```

Stop the application:

```bash
docker compose down
```

Run database migrations:

```bash
docker compose exec api npm run migrate up
```

## Database

PostgreSQL stores:

* Short code
* Original URL
* Owner ID
* Click count
* Creation time
* Expiration time

PostgreSQL data is persisted using a Docker volume.

## Environment

The application uses environment variables for database, Redis, port, and application configuration.

Do not commit the `.env` file to Git.

## Local Development

Start the complete application:

```bash
docker compose up -d
```

Then access:

```text
http://localhost:3000
```
