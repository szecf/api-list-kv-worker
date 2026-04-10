# API List KV Worker

A Cloudflare Worker that fetches IP addresses from a Cloudflare managed list and serves them via a simple API endpoint.

## Overview

This worker performs two main functions:

1. **Scheduled Task (Cron)**: Fetches IP addresses from a Cloudflare managed list daily at 6 AM UTC and stores them in KV storage
2. **HTTP API**: Serves the cached IP addresses via a GET endpoint

## Features

- Automated daily updates of IP list data
- Caches only essential data (IP addresses and modification timestamps)
- Error handling with detailed error responses
- Returns data with timestamp of last update

## API Response

```json
{
  "fetched_at": "2026-04-10T06:00:00.000Z",
  "ips": [
    "16.88.140.122",
    "25.162.164.32",
    "59.97.176.156"
  ]
}
```

## Configuration

### Environment Variables

Set these in your Cloudflare Worker settings or `.dev.vars` file:

- `CF_ACCOUNT_ID`: Your Cloudflare account ID
- `CF_LIST_ID`: The ID of the managed IP list
- `CF_API_TOKEN`: Cloudflare API token with permissions to read lists

### KV Namespace

- **Binding**: `MANAGED_IP_LIST`
- **ID**: `6084b53b26d5435789b7409bb055c30d`

### Cron Schedule

Runs daily at 6:00 AM UTC (`0 6 * * *`)

## Development

```bash
# Install dependencies
npm install

# Run locally
npx wrangler dev

# Manually trigger cron job locally
curl "http://localhost:8787/cdn-cgi/handler/scheduled"

# Deploy to Cloudflare
npx wrangler deploy
```

## Deployment

```bash
npx wrangler deploy
```

The worker will be available at: `https://api-list-kv-worker.szerongtham6679.workers.dev`
