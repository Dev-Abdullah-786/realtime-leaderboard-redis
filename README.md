# Real-Time Redis Leaderboard API

Simple Node.js + Express API for a Redis sorted-set leaderboard.

## What this project does

- Stores player scores in Redis sorted set (`game:leaderboard` by default)
- Stores player metadata in Redis hash (`player:meta:<username>`)
- Supports rank-based, score-based, and player-specific queries
- Includes seed and simulator scripts for quick local testing

## Tech stack

- Node.js
- Express
- Redis
- ioredis

## Project structure

```text
src/
  index.js                 # server bootstrap + middleware + /health
  redisClient.js           # redis connection setup
  leaderboardService.js    # redis read/write operations
  routes/leaderboard.js    # API routes and validation
  seed.js                  # seed sample players
  simulator.js             # continuous random score updates
```

## Requirements

- Node.js 18+
- Redis 6.2+

## Environment variables

Copy values into `.env`:

```env
PORT=3000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
LEADERBOARD_KEY=game:leaderboard
PLAYER_META_PREFIX=player:meta:
```

## Install and run

```bash
npm install
npm start
```

Useful scripts:

```bash
npm run seed
npm run simulate
npm run dev
```

## Redis data model

- Sorted set key: `game:leaderboard`
  - member: `username`
  - score: `score`
- Hash key: `player:meta:<username>`
  - fields: optional metadata (`country`, `tier`, `avatar`, `joinedAt`, etc.)
  - TTL: 30 days

## API base URL

```text
http://localhost:3000
```

## API endpoints

### Health

- `GET /health`

Example response:

```json
{
  "status": "ok",
  "redis": "connected",
  "version": "7.2.5",
  "timestamp": "2026-02-28T10:00:00.000Z"
}
```

### Leaderboard

- `GET /api/leaderboard`
  - Query options:
    - `?limit=10` (default `10`, max `100`)
    - `?from=11&to=20` (rank range, 1-indexed, max page size 100)

Default response shape:

```json
{
  "success": true,
  "total": 20,
  "showing": 10,
  "leaderboard": [{ "rank": 1, "username": "DragonSlayer99", "score": 982450 }]
}
```

Range response shape:

```json
{
  "success": true,
  "from": 11,
  "to": 20,
  "leaderboard": [{ "rank": 11, "username": "QuantumKnight", "score": 278640 }]
}
```

- `GET /api/leaderboard/score-range?min=100000&max=500000`

Response shape:

```json
{
  "success": true,
  "min": 100000,
  "max": 500000,
  "count": 6,
  "players": [{ "rank": 1, "username": "IronPhoenix", "score": 474390 }]
}
```

### Player

- `GET /api/leaderboard/player/:username`

Success response:

```json
{
  "success": true,
  "player": {
    "username": "DragonSlayer99",
    "rank": 1,
    "score": 982450,
    "country": "US",
    "tier": "Legend",
    "avatar": "dragon",
    "joinedAt": "2026-02-28T10:00:00.000Z"
  }
}
```

Not found response:

```json
{
  "success": false,
  "error": "Player not found"
}
```

- `POST /api/leaderboard/player`
  - Body: `{ "username": "NewPlayer", "score": 0, "country": "US", "tier": "Iron" }`

- `DELETE /api/leaderboard/player/:username`

### Score operations

- `POST /api/leaderboard/score`
  - Body: `{ "username": "DragonSlayer99", "score": 1000000 }`
  - Validation:
    - `username` required
    - `score` required, number, and `>= 0`

- `POST /api/leaderboard/increment`
  - Body: `{ "username": "DragonSlayer99", "amount": 5000 }`
  - Validation:
    - `username` required
    - `amount` required and must be number
  - Negative `amount` is allowed (decrement)

### Admin

- `POST /api/leaderboard/reset`

## Standard errors

- 400 validation errors:

```json
{
  "success": false,
  "error": "username and score required"
}
```

- 404 unknown route:

```json
{
  "success": false,
  "error": "GET /api/unknown not found"
}
```

- 500 internal server error:

```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Postman collection

Updated collection file:

- `Redis-Leaderboard.postman_collection.json`

Import it into Postman and set `baseUrl` variable (default `http://localhost:3000`).
