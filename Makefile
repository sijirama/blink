.PHONY: dev prod clean build

# Development
dev:
	docker compose -f compose.dev.yml up --build

# Production
prod:
	docker compose -f compose.prod.yml up --build

# Build the application
build:
	go build -o main .

# Clean up
clean:
	docker compose -f compose.dev.yml down -v
	docker compose -f compose.prod.yml down -v
	#docker system prune -af
	rm -f main

# Run tests
test:
	go test ./...

# Generate API documentation (if you're using Swagger or similar)
docs:
	swag init

# Lint the code
lint:
	golangci-lint run

# Format the code
fmt:
	go fmt ./...

# Run the application locally without Docker
run: build
	./main

# Help command to list available commands
help:
	@echo "Available commands:"
	@echo "  make dev          - Start development environment"
	@echo "  make prod         - Start production environment"
	@echo "  make build        - Build the Go application"
	@echo "  make clean        - Clean up containers and built files"
	@echo "  make test         - Run tests"
	@echo "  make docs         - Generate API documentation"
	@echo "  make lint         - Lint the code"
	@echo "  make fmt          - Format the code"
	@echo "  make run          - Run the application locally"
