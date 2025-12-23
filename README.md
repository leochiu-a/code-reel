## Run Locally

**Prerequisites:** Node.js, pnpm

## Docker (dev, puppeteer + ffmpeg)

The dev container installs Chromium and ffmpeg so exports behave close to production.

### With Docker Compose

```
docker compose -f docker-compose.dev.yml up --build
```

## Docker (production-like)

```
docker build -t codesnap-prod .
docker run --rm -it -p 3000:3000 codesnap-prod
```
