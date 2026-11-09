include .env

MAKEFLAGS += --no-print-directory

COMPOSE := docker compose -f docker-compose.${APP_ENV}.yml
CONTAINER_NAME := white-label-stock-web

f :=
art:
	@cat configs/scripts/arts/${f}.txt
	@echo

echo-system:
	@make art f=system

echo-buda:
	@make art f=buda

build:
	@$(COMPOSE) build --no-cache

build-cache:
	@$(COMPOSE) build

# Só no local (bind mount): em homolog/produção as dependências já vêm instaladas na imagem (Dockerfile.deploy).
install-deps:
ifeq ($(APP_ENV),local)
	@$(COMPOSE) run --rm --no-deps $(CONTAINER_NAME) npm install
else
	@echo "APP_ENV=$(APP_ENV): dependências já instaladas na imagem, nada a fazer."
endif

logs:
	@docker logs -f $(CONTAINER_NAME)

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
	@$(COMPOSE) build $(CONTAINER_NAME)
	@$(COMPOSE) up -d --no-deps $(CONTAINER_NAME)

c :=
exec:
	@$(COMPOSE) exec $(CONTAINER_NAME) $(c)

shell:
	@$(COMPOSE) exec -it $(CONTAINER_NAME) /bin/sh

b ?=
npm-install:
	@make exec c="npm install $(b)"

test:
	@make exec c="npm run test"

test-server:
	@make exec c="npm run test:server"

test-server-coverage:
	@make exec c="npm run test:server:coverage"

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
	@echo "░▒▓█ \033[38;2;22;198;12m$(or $(APP_NAME),StockFlow)\033[0m working on http://localhost:$(APP_PORT)"
	@echo
	@make echo-buda
	@echo "\033[38;2;170;0;255m🞮\033[0m Vinícius Nolêto de Araújo"
	@echo "\033[38;2;170;0;255m🞉\033[0m GitHub: \033[38;2;88;166;255mhttps://github.com/viniciusNoleto\033[0m"
	@echo "\033[38;2;170;0;255m🞉\033[0m LinkedIn: \033[38;2;88;166;255mhttps://www.linkedin.com/in/vin%C3%ADcius-nol%C3%AAto-de-ara%C3%BAjo\033[0m"
	@echo

check-api:
	@curl -fsS -o /dev/null $(subst host.docker.internal,localhost,$(API_URL))/up \
		&& echo "API online em $(API_URL)" \
		|| echo "\033[38;2;255;196;12mAviso:\033[0m API fora do ar em $(API_URL) — suba o white-label-stock-api (make install / make up lá)."

install:
	@make echo-system
	@make step s=1 t=4 m="Building the Docker image..."
	@make build
	@make step s=2 t=4 m="Installing dependencies (npm install)..."
	@make install-deps
	@make step s=3 t=4 m="Starting the containers..."
	@make clear-up
	@make step s=4 t=4 m="Checking the API..."
	@make check-api
	@make last-step
