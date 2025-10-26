# Matcha Project Makefile

.PHONY: up down logs build rebuild clean prune kill help

# Default target
help: ## Show this help
	@echo "Matcha Project Management Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_0-9%-]+:.*?## .*$$' $(word 1,$(MAKEFILE_LIST)) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "%-30s %s\n", $$1, $$2}'

up: ## Start the application with docker-compose
	docker compose up -d

down: ## Stop the application with docker-compose
	docker compose down

logs: ## View application logs
	docker compose logs -f

build: ## Build the application services
	docker compose build

rebuild: ## Rebuild the application services
	docker compose build --no-cache

clean: ## Stop and remove all containers, networks, and images
	docker compose down -v
	docker compose down --rmi all

prune: ## Remove unused Docker objects (containers, networks, images)
	docker container prune -f
	docker network prune -f
	docker image prune -f
	docker volume prune -f

kill: ## Kill all running containers related to this project
	docker compose kill
	docker ps -aq -f "label=matcha" | xargs -r docker rm -f

nuke: ## Remove ALL Docker containers and images (⚠️ Use with caution!)
	docker ps -aq | xargs -r docker stop
	docker ps -aq | xargs -r docker rm -f
	docker images -aq | xargs -r docker rmi -f

full-clean: ## Completely remove all Docker data (containers, images, volumes, cache)
	docker stop $$(docker ps -aq) 2>/dev/null || true
	docker rm -f $$(docker ps -aq) 2>/dev/null || true
	docker rmi -f $$(docker images -q) 2>/dev/null || true
	docker volume rm $$(docker volume ls -q) 2>/dev/null || true
	docker builder prune -af || true
	docker system prune -af --volumes || true

dev: ## Start the application in development mode
	docker compose -f docker-compose.yml up -d

dev-logs: ## View development logs
	docker compose logs -f

# Aliases
start: up ## Alias for up
stop: down ## Alias for down
restart: down up ## Restart the application