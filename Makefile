.PHONY: up down build clean logs

# Start all services
up:
	docker compose up -d --build

# Stop all services
down:
	docker compose down

# Build all services
build:
	docker compose build

# View logs
logs:
	docker compose logs -f

# Clean up
clean:
	docker compose down -v --remove-orphans
	docker system prune -f

# Install dependencies
install:
	cd api && npm install
	cd web && npm install

# Run tests
test:
	cd api && npm test
	cd web && npm test

# Format code
format:
	cd api && npm run format
	cd web && npm run format

# Lint code
lint:
	cd api && npm run lint
	cd web && npm run lint
