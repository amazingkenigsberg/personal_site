# OpenClaw sandbox — no access to your laptop or files

OpenClaw runs **entirely inside Docker**. It has **no mount** to your home directory or any host path. All config and workspace live in Docker named volumes only.

- **Safe:** Container cannot read or write your files.
- **Isolated:** Gateway binds to `127.0.0.1` so it’s only reachable from this machine.
- **Disposable:** Remove the volumes to wipe all OpenClaw data.

## Requirements

- Docker Desktop (or Docker Engine) + Docker Compose v2
- OpenClaw image `openclaw:local` (build once from source, see below)

## 1. Build the OpenClaw image (one-time)

The image is not published; you build it from the official repo. In a directory **outside** this sandbox (e.g. a temp folder):

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
docker build -t openclaw:local -f Dockerfile .
```

You can delete the `openclaw` clone after the image is built.

## 2. Create `.env` in this folder

```bash
cd openclaw-sandbox
cp .env.example .env
```

Edit `.env` if you want to change the token or ports. The default token is random and written to `.env.example` after first run (see below).

## 3. Generate a gateway token (if not set)

```bash
# One-time: create .env with a random token
export OPENCLAW_GATEWAY_TOKEN=$(openssl rand -hex 32)
echo "OPENCLAW_GATEWAY_TOKEN=$OPENCLAW_GATEWAY_TOKEN" >> .env
echo "OPENCLAW_GATEWAY_PORT=18789" >> .env
echo "OPENCLAW_BRIDGE_PORT=18790" >> .env
```

Or copy `.env.example` to `.env` and set `OPENCLAW_GATEWAY_TOKEN` to any long random string.

## 4. Onboarding (first run only)

```bash
docker compose -f docker-compose.sandbox.yml run --rm openclaw-cli onboard --no-install-daemon
```

When prompted:

- Gateway bind: **lan** or keep default
- Gateway auth: **token**
- Use the token from your `.env` (e.g. `OPENCLAW_GATEWAY_TOKEN`)

## 5. Start the gateway

```bash
docker compose -f docker-compose.sandbox.yml up -d openclaw-gateway
```

- Control UI: **http://127.0.0.1:18789/**
- Paste the token from `.env` in Settings → token.

## 6. Use the CLI (optional)

Run OpenClaw CLI inside the same sandbox (same volumes, no host access):

```bash
docker compose -f docker-compose.sandbox.yml run --rm openclaw-cli <command>
# e.g.
docker compose -f docker-compose.sandbox.yml run --rm openclaw-cli status
docker compose -f docker-compose.sandbox.yml run --rm openclaw-cli dashboard
```

## Stop and remove

```bash
docker compose -f docker-compose.sandbox.yml down
```

To **delete all sandbox data** (config + workspace):

```bash
docker compose -f docker-compose.sandbox.yml down -v
```

## Summary

| What              | Where it lives              | Host access |
|-------------------|----------------------------|-------------|
| Config / workspace| Docker volumes only        | **None**    |
| Gateway process   | Inside container           | **None**    |
| `.env` (token)    | This folder on host        | Only token/ports |

The container never sees your home directory or any other host path.
