include .env

MAKEFLAGS += --no-print-directory

COMPOSE := docker compose -f docker-compose.${APP_ENV}.yml
APP_NAME := white-label-inventory-system-front

f :=
art:
	@cat configs/scripts/arts/${f}.txt
	@echo

echo-system:
	@make art f=system

build:
	@$(COMPOSE) build --no-cache

build-cache:
	@$(COMPOSE) build

install-deps:
	@$(COMPOSE) run --rm --no-deps $(APP_NAME) npm install

db-migrate:
	@$(COMPOSE) exec $(APP_NAME) npm run db:migrate

db-generate:
	@$(COMPOSE) exec $(APP_NAME) npm run db:generate

db-studio:
	@$(COMPOSE) exec $(APP_NAME) npm run db:studio

logs:
	@docker logs -f $(APP_NAME)

watch:
	@$(COMPOSE) up

clear-up:
	@$(COMPOSE) up -d

up:
	@make clear-up
	@make echo-system

down:
	@$(COMPOSE) down

restart:
	@make down
	@make up

phoenix:
	@make down
	@make build-cache
	@make up

update-build:
	@$(COMPOSE) build $(APP_NAME)
	@$(COMPOSE) up -d --no-deps $(APP_NAME)

c :=
exec:
	@$(COMPOSE) exec $(APP_NAME) $(c)

shell:
	@$(COMPOSE) exec -it $(APP_NAME) /bin/sh

b ?=
npm-install:
	@make exec c="npm install $(b)"

lint:
	@make exec c="npm run lint"

test:
	@make exec c="npm run test"

test-coverage:
	@make exec c="npm run test:coverage"

test-e2e:
	@APP_URL=http://localhost:$(APP_PORT) npm run test:e2e

s :=
t :=
m :=
step:
	@echo
	@echo "█▓▒░ \033[38;2;255;196;12m[$(s)/$(t)]\033[0m $(m)"
	@echo

last-step:
	@echo
	@echo "░▒▓█ \033[38;2;22;198;12mWhite Label Inventory System\033[0m working on http://localhost:$(APP_PORT)"
	@echo
	@echo "\033[38;2;170;0;255m🞮\033[0m Vinícius Nolêto de Araújo"
	@echo "\033[38;2;170;0;255m🞉\033[0m GitHub: \033[38;2;88;166;255mhttps://github.com/viniciusNoleto\033[0m"
	@echo "\033[38;2;170;0;255m🞉\033[0m LinkedIn: \033[38;2;88;166;255mhttps://www.linkedin.com/in/vin%C3%ADcius-nol%C3%AAto-de-ara%C3%BAjo\033[0m"
	@echo

install:
	@make echo-system
	@make step s=1 t=5 m="Building the Docker image..."
	@make build
	@make step s=2 t=5 m="Installing dependencies (npm install)..."
	@make install-deps
	@make step s=3 t=5 m="Starting the containers..."
	@make clear-up
	@make step s=4 t=5 m="Running database migrations..."
	@make db-migrate
	@make step s=5 t=5 m="Finishing installation..."
	@make last-step
