# Mapp-App

A full-stack, map-centric web application built with React, Node.js, and PostGIS.

## Architecture

- **Frontend**: React + Vite + TypeScript + MapLibre GL JS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 16 + PostGIS
- **Cache/Queue**: Redis
- **Contracts**: OpenAPI 3.0
- **Containers**: Docker + docker-compose
- **Orchestration**: Kubernetes

## Quick Start

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Start the development environment:
   ```bash
   make up
   ```

3. Open your browser to `http://localhost:3000`

## Development

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- Database: `localhost:5432`
- Redis: `localhost:6379`

## API Endpoints

- `GET /healthz` - Health check
- `GET /readyz` - Readiness check
- `POST /pins` - Create a new pin
- `GET /pins?near=lat,lng&radius=m` - Get nearby pins
- `GET /search?q=query` - Search for POIs

## Kubernetes Deployment

```bash
kubectl apply -k k8s/base/
```

## Project Structure

```
MY-APP/
├── contracts/          # OpenAPI specifications
├── api/               # Backend API
├── web/               # Frontend React app
├── k8s/               # Kubernetes manifests
└── docker-compose.yml # Local development
```
