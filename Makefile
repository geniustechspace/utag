SHELL := /bin/bash

# Variables from project configuration and git
PROJECT_NAME ?= $(shell (jq -r '.name' package.json || echo "Unknown Project"))
PROJECT_VERSION ?= $(shell (jq -r '.version' package.json || echo "Unknown Version"))
GIT_BRANCH ?= $(shell (git rev-parse --abbrev-ref HEAD || echo "Unknown Branch"))
GIT_COMMIT_SHA ?= $(shell (git rev-parse --verify HEAD || echo "Unknown SHA"))
GIT_COMMIT_SHORT_SHA ?= $(shell (git rev-parse --verify --short HEAD || echo "Unknown Short SHA"))

.PHONY: help
help: ## Show this help message
	@echo ======================================================================
	@echo
	@echo "Project: $(PROJECT_NAME) || Version: $(PROJECT_VERSION)"
	@echo
	@echo "Git Branch: $(GIT_BRANCH) || SHA: $(GIT_COMMIT_SHA)"
	@echo
	@echo ======================================================================
	@echo
	@echo "Commands             Description"
	@echo ======================================================================
	@egrep -h '\s##\s' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ====================================================================

.PHONY: make-executable
make-executable: ## Make scripts executable
	@echo "Setting executable permission for dev scripts"
	chmod +x "$(CURDIR)/scripts/utils/install-pnpm.sh"
	chmod +x "$(CURDIR)/scripts/utils/install-jq.sh"
	@echo

.PHONY: setup-dev
setup-dev: make-executable ## Set up your development environment
	@echo "Setting up the development environment..."
	chmod +x "$(CURDIR)/scripts/dev/setup.sh"
	"$(CURDIR)/scripts/dev/setup.sh"
	@echo

.PHONY: setup-dep
setup-dep: make-executable ## Set up your development environment
	@echo "Setting up the development environment..."
	"$(CURDIR)/scripts/dep/setup.sh"
	@echo

.PHONY: install
install: setup-dev ## Install dependencies
	pnpm install

.PHONY: lint
lint: install ## Run linters to check code quality
	@echo "Running linter..."
	pnpm run lint

.PHONY: dev
dev: install ## Start the development environment
	@echo "Starting development environment..."
	pnpm run dev

.PHONY: build
build: install ## Build the project
	@echo "Building the project..."
	pnpm run build

.PHONY: start
start: build ## Start the application
	@echo "Starting the application..."
	pnpm run start

.PHONY: test
test: install ## Run all tests
	@echo "Running tests..."
	pnpm run test

.PHONY: clean
clean: ## Clean files
	pnpm cache clean

.PHONY: deep-clean
deep-clean: clean ## Delete all node_modules and re-install them
	pnpm cache clean --force
	rm -rf node_modules
	pnpm install
